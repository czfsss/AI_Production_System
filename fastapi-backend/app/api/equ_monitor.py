from multiprocessing import managers
from fastapi import APIRouter, HTTPException, WebSocket
from typing import List, Optional
from datetime import datetime, time
from fastapi import APIRouter, HTTPException
import taosrest
import pymysql
from config import tdengine_config, point_map, mysql_config
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)

# 导入模型和查询模型
from schemas.equ_bending import *


equ_bending_router = APIRouter()


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
            host=mysql_config.host,
            port=mysql_config.port,
            user=mysql_config.user,
            password=mysql_config.password,
            database=mysql_config.database,
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


@equ_bending_router.post("/equbending", response_model=ResponseEquStatus)
async def equ_bending(equname: QueryEquBending):
    client = None
    try:
        client = taosrest.RestClient(
            url=tdengine_config.host,
            user=tdengine_config.user,
            password=tdengine_config.password,
            timeout=30,
        )
        logging.info(point_map.point[equname.equ_name])
        print(point_map.point[equname.equ_name])
        if point_map.point[equname.equ_name] is None:
            raise HTTPException(status_code=400, detail="设备名称错误！")
        elif "卷烟机" in equname.equ_name:

            sql = f"SELECT * FROM hysc.s{point_map.point[equname.equ_name]['status']} order by ts desc limit 1"
            logging.info(sql)
            result = client.sql(sql)
            if result["data"]:
                result = result["data"][0][1]
                logging.info(result)
                if result == 1:
                    return ResponseEquStatus(equipment_status="运行")
                elif result == 3:
                    stop_reason = await query_stop_history(
                        point_map.point[equname.equ_name].split("_")[0]
                    )
                    logging.info(stop_reason)
                    if stop_reason:
                        return ResponseEquStatus(
                            equipment_status=f"发生故障：{stop_reason}"
                        )
                    else:
                        return ResponseEquStatus(equipment_status="发生故障")
                return ResponseEquStatus(equipment_status=result)
        elif "包装机" in equname.equ_name:
            sql = f"SELECT * FROM hysc.s{point_map.point[equname.equ_name]['status']}_60028 order by ts desc limit 1"
            sql1 = f"SELECT * FROM hysc.s{point_map.point[equname.equ_name]['status']}_60048 order by ts desc limit 1"
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
        logging.error(f"Failed to query data from power.meters, ErrMessage:{err}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to query data from power.meters, ErrMessage:{err}",
        )
