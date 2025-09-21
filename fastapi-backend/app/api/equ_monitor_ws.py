from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    WebSocketException,
)
from typing import List, Dict, Optional
import asyncio
import json
import logging
import taosrest
from datetime import datetime
from config import tdengine_config, point_map
from config.mysql_config import shucai
from schemas.equ_bending import QueryEquBending, ResponseEquStatus
import pymysql
from config.point_map import get_all_tablepoint
from schemas.websocket_connect import ConnectionManager

# 配置日志
logging.basicConfig(level=logging.INFO)

# 创建WebSocket路由器
websocket_router = APIRouter()


manager = ConnectionManager()


async def query_stop_history(mch_code: str) -> Optional[str]:
    """
    查询设备停机历史记录

    Args:
        mch_code (str): 设备代码

    Returns:
        Optional[str]: 停机原因文本，如果没有找到记录则返回None
    """
    connection = None
    cursor = None

    try:
        # 建立数据库连接
        connection = pymysql.connect(
            host=shucai["host"],
            port=shucai["port"],
            user=shucai["user"],
            password=shucai["password"],
            database=shucai["database"],
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
        )

        # 创建游标
        cursor = connection.cursor()

        # 执行SQL查询 - 使用参数化查询防止SQL注入
        sql = "SELECT text FROM dc_stophistory WHERE mchCode = %s AND startTime >= NOW() - INTERVAL 1 HOUR ORDER BY startTime DESC LIMIT 1"
        logging.info(f"执行SQL查询: {sql} 参数: {mch_code}")

        cursor.execute(sql, (mch_code,))

        # 获取查询结果
        result = cursor.fetchone()

        if result and "text" in result:
            return result["text"]
        else:
            return None

    except Exception as err:
        logging.error(f"查询MySQL失败: {err}")
        return None
    finally:
        # 关闭游标和连接
        if cursor:
            cursor.close()
        if connection:
            connection.close()


async def execute_single_query(params, value):
    client_single = None
    try:
        client_single = taosrest.RestClient(
            url=tdengine_config.host,
            user=tdengine_config.user,
            password=tdengine_config.password,
            timeout=30,
        )
        sql = f"SELECT * FROM hysc.s{value} order by ts desc limit 1"
        logging.info(f"执行查询 {params}: {sql}")
        result = client_single.sql(sql)

        if result.get("data") and len(result["data"]) > 0:
            param_value = result["data"][0][1]  # 获取查询结果的值
            return params, param_value
        return params, None
    except Exception as e:
        logging.error(f"查询参数 {params} 失败: {e}")
        return params, None


async def get_equ_params(equipment_name: str) -> Dict[str, Optional[str]]:
    """
    获取设备的所有参数值
    """
    params = await get_all_tablepoint(equipment_name)
    if params is None:
        raise HTTPException(status_code=400, detail="设备名称错误！")

    param_results = {}
    # 创建所有查询任务
    tasks = []
    for params, value in params.items():
        tasks.append(execute_single_query(params, value))
    # 并行执行所有查询
    results = await asyncio.gather(*tasks)
    # 处理查询结果
    for param_name, param_value in results:
        if param_value is not None:
            param_results[param_name] = param_value
    return param_results


async def query_equipment_params(equipment_name: str) -> Dict[str, str | None] | None:
    """
    查询设备状态，与原有接口逻辑相同
    """
    try:
        if "卷烟机" in equipment_name:
            # 获取设备的所有参数值
            param_results = await get_equ_params(equipment_name)
            # logging.info(f"{equipment_name}的参数: {param_results}")
            # 获取状态值进行设备状态判断（保持与原逻辑一致）
            if param_results.get("status"):
                # 获取状态的值
                if param_results["status"] == 1:
                    param_results["status"] = "运行"
                    return param_results
                elif param_results["status"] == 3:
                    # 获取设备ID用于查询停机历史
                    all_tablepoint = await get_all_tablepoint(equipment_name)
                    equipment_id = all_tablepoint["status"].split("_")[0]
                    stop_reason = await query_stop_history(equipment_id)
                    logging.info(stop_reason)
                    if stop_reason:
                        param_results["status"] = stop_reason
                    else:
                        param_results["status"] = "发生故障:未知"
                    return param_results
                # 其他状态值直接返回
                return param_results

            # 如果没有查询结果，返回默认状态
            return param_results

        elif "包装机" in equipment_name:

            param_results = await get_equ_params(equipment_name)
            # 获取主机和辅机的状态
            main_status = param_results.get("main_status")
            auxiliary_status = param_results.get("auxiliary_status")
            if main_status and auxiliary_status:
                if main_status == auxiliary_status and main_status in ("生产", "运行"):
                    del param_results["main_status"]
                    del param_results["auxiliary_status"]
                    param_results["status"] = "运行"
                    return param_results
                elif (
                    main_status in ("生产", "运行") and auxiliary_status != main_status
                ):
                    del param_results["main_status"]
                    del param_results["auxiliary_status"]
                    param_results["status"] = f"辅机故障：{auxiliary_status}"
                    return param_results
                elif (
                    auxiliary_status in ("生产", "运行")
                    and main_status != auxiliary_status
                ):
                    del param_results["main_status"]
                    del param_results["auxiliary_status"]
                    param_results["status"] = f"主机故障：{main_status}"
                    return param_results
                else:
                    del param_results["main_status"]
                    del param_results["auxiliary_status"]
                    param_results["status"] = (
                        f"主机故障：{main_status},辅机故障：{auxiliary_status}"
                    )
                    return param_results
        else:
            raise HTTPException(status_code=400, detail="设备名称错误！")

    except Exception as err:
        logging.error(f"查询设备状态失败: {err}")
        return None


async def equipment_monitor(
    equipment_name: str, websocket: WebSocket, interval: int = 2
):
    """
    设备状态监控任务，定期查询设备状态并通过WebSocket推送
    """
    try:
        while equipment_name in manager.active_connections:
            # 检查WebSocket连接是否仍然活跃
            try:
                # 发送一个ping消息来检查连接是否仍然活跃
                await websocket.send_json({"type": "ping"})
            except Exception:
                # 如果发送失败，说明连接已经断开
                logging.info(f"设备 {equipment_name} 的WebSocket连接已断开，停止监控")
                manager.disconnect(websocket, equipment_name)
                break

            try:
                # 查询设备状态
                param_results = await query_equipment_params(equipment_name)
                logging.info(f"{equipment_name}的参数: {param_results}")
                if param_results:
                    await manager.send_personal_message(
                        json.dumps(param_results), equipment_name
                    )

                # 等待指定间隔后再次查询
                await asyncio.sleep(interval)

            except Exception as e:
                logging.error(f"监控设备 {equipment_name} 状态时出错: {e}")
                await asyncio.sleep(interval)  # 出错后等待一段时间再继续
    except asyncio.CancelledError:
        logging.info(f"设备 {equipment_name} 的监控任务被取消")
    except Exception as e:
        logging.error(f"监控设备 {equipment_name} 时发生未预期的错误: {e}")
        manager.disconnect(websocket, equipment_name)


@websocket_router.websocket("/ws/equipment/{equipment_name}")
async def websocket_endpoint(websocket: WebSocket, equipment_name: str):
    """
    WebSocket端点，用于实时推送设备状态
    """
    await manager.connect(websocket, equipment_name)
    logging.info(f"{equipment_name} 已绑定")

    try:
        if equipment_name in manager.active_connections:
            await equipment_monitor(equipment_name, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket, equipment_name)
        logging.info(f"设备 {equipment_name} 的WebSocket连接已断开")
    except WebSocketException as e:
        logging.error(f"WebSocket连接出错: {e}")
        manager.disconnect(websocket, equipment_name)
