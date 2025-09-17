from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import List, Dict, Optional
import asyncio
import json
import logging
import taosrest
from datetime import datetime
from config import tdengine_config, point_map, mysql_config
from schemas.equ_bending import QueryEquBending, ResponseEquStatus
from api.equ_monitor import query_stop_history

# 配置日志
logging.basicConfig(level=logging.INFO)

# 创建WebSocket路由器
websocket_router = APIRouter()

# 存储活跃的WebSocket连接
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.equipment_status_cache: Dict[str, str] = {}
    
    async def connect(self, websocket: WebSocket, equipment_name: str):
        await websocket.accept()
        if equipment_name not in self.active_connections:
            self.active_connections[equipment_name] = []
        self.active_connections[equipment_name].append(websocket)
        logging.info(f"WebSocket连接已建立，设备: {equipment_name}")
    
    def disconnect(self, websocket: WebSocket, equipment_name: str):
        if equipment_name in self.active_connections:
            if websocket in self.active_connections[equipment_name]:
                self.active_connections[equipment_name].remove(websocket)
            if not self.active_connections[equipment_name]:
                del self.active_connections[equipment_name]
        logging.info(f"WebSocket连接已断开，设备: {equipment_name}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast_to_equipment(self, message: str, equipment_name: str):
        if equipment_name in self.active_connections:
            for connection in self.active_connections[equipment_name]:
                try:
                    await connection.send_text(message)
                except:
                    # 连接可能已经断开，移除它
                    self.active_connections[equipment_name].remove(connection)
    
    def update_status_cache(self, equipment_name: str, status: str):
        self.equipment_status_cache[equipment_name] = status
    
    def get_cached_status(self, equipment_name: str) -> Optional[str]:
        return self.equipment_status_cache.get(equipment_name)

manager = ConnectionManager()

async def query_equipment_status(equipment_name: str) -> Optional[ResponseEquStatus]:
    """
    查询设备状态，与原有接口逻辑相同
    """
    client = None
    try:
        client = taosrest.RestClient(
            url=tdengine_config.host,
            user=tdengine_config.user,
            password=tdengine_config.password,
            timeout=30,
        )
        
        if point_map.point.get(equipment_name) is None:
            raise HTTPException(status_code=400, detail="设备名称错误！")
        
        elif "卷烟机" in equipment_name:
            sql = f"SELECT * FROM hysc.s{point_map.point[equipment_name]} order by ts desc limit 1"
            logging.info(sql)
            result = client.sql(sql)
            if result["data"]:
                result = result["data"][0][1]
                logging.info(result)
                if result == 1:
                    return ResponseEquStatus(equipment_status="运行")
                elif result == 3:
                    stop_reason = await query_stop_history(
                        point_map.point[equipment_name].split("_")[0]
                    )
                    logging.info(stop_reason)
                    if stop_reason:
                        return ResponseEquStatus(
                            equipment_status=f"发生故障：{stop_reason}"
                        )
                    else:
                        return ResponseEquStatus(equipment_status="发生故障")
                return ResponseEquStatus(equipment_status=result)
        
        elif "包装机" in equipment_name:
            sql = f"SELECT * FROM hysc.s{point_map.point[equipment_name]}_60028 order by ts desc limit 1"
            sql1 = f"SELECT * FROM hysc.s{point_map.point[equipment_name]}_60048 order by ts desc limit 1"
            logging.info(sql)
            logging.info(sql1)
            main_mach = client.sql(sql)
            auxiliary_mach = client.sql(sql1)
            if main_mach["data"] and auxiliary_mach["data"]:
                main_mach = main_mach["data"][0][1]
                auxiliary_mach = auxiliary_mach["data"][0][1]
                if main_mach == "生产" and auxiliary_mach == "生产":
                    return ResponseEquStatus(equipment_status="运行")
                elif main_mach == "生产" and auxiliary_mach != "生产":
                    return ResponseEquStatus(
                        equipment_status="辅机故障：" + auxiliary_mach
                    )
                elif main_mach != "生产" and auxiliary_mach == "生产":
                    return ResponseEquStatus(equipment_status="主机故障：" + main_mach)
                else:
                    return ResponseEquStatus(equipment_status=main_mach)
        else:
            raise HTTPException(status_code=404, detail="数据不存在")
    
    except Exception as err:
        logging.error(f"查询设备状态失败: {err}")
        return None
    finally:
        if client:
            client.close()

async def equipment_status_monitor(equipment_name: str, interval: int = 2):
    """
    设备状态监控任务，定期查询设备状态并通过WebSocket推送
    """
    while equipment_name in manager.active_connections:
        try:
            # 查询设备状态
            status_response = await query_equipment_status(equipment_name)
            
            if status_response:
                current_status = status_response.equipment_status
                cached_status = manager.get_cached_status(equipment_name)
                
                # 只有状态发生变化时才推送
                if cached_status != current_status:
                    manager.update_status_cache(equipment_name, current_status)
                    
                    # 构造消息
                    message = {
                        "equipment_name": equipment_name,
                        "status": current_status,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    # 广播给所有监听该设备的WebSocket连接
                    await manager.broadcast_to_equipment(json.dumps(message), equipment_name)
                    logging.info(f"设备 {equipment_name} 状态更新: {current_status}")
            
            # 等待指定间隔后再次查询
            await asyncio.sleep(interval)
            
        except Exception as e:
            logging.error(f"监控设备 {equipment_name} 状态时出错: {e}")
            await asyncio.sleep(interval)  # 出错后等待一段时间再继续

@websocket_router.websocket("/ws/equipment/{equipment_name}")
async def websocket_endpoint(websocket: WebSocket, equipment_name: str):
    """
    WebSocket端点，用于实时推送设备状态
    """
    await manager.connect(websocket, equipment_name)
    
    try:
        # 如果这是第一个连接到此设备的WebSocket，启动监控任务
        if len(manager.active_connections.get(equipment_name, [])) == 1:
            asyncio.create_task(equipment_status_monitor(equipment_name))
        
        # 保持连接并处理客户端消息
        while True:
            try:
                # 等待客户端消息（可以用于心跳检测或控制命令）
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # 处理客户端消息
                if message.get("type") == "ping":
                    # 心跳响应
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.now().isoformat()}))
                elif message.get("type") == "get_status":
                    # 客户端请求当前状态
                    cached_status = manager.get_cached_status(equipment_name)
                    if cached_status:
                        await websocket.send_text(json.dumps({
                            "equipment_name": equipment_name,
                            "status": cached_status,
                            "timestamp": datetime.now().isoformat()
                        }))
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logging.error(f"处理WebSocket消息时出错: {e}")
                break
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, equipment_name)
        logging.info(f"设备 {equipment_name} 的WebSocket连接已断开")
    except Exception as e:
        logging.error(f"WebSocket连接出错: {e}")
        manager.disconnect(websocket, equipment_name)