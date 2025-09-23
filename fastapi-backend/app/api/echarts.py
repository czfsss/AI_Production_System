import asyncio
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, time
from fastapi import WebSocket, WebSocketDisconnect, WebSocketException
import logging
import json
import time
from decimal import Decimal
# 修复导入路径
from api.mysql_query import query_mysql
from api.equ_monitor_ws import execute_single_query
from config.mysql_config import shucai, mes
# 导入模型和查询模型
from schemas.fault_info import *
from schemas.echarts import *
from schemas.websocket_connect import ConnectionManager

# 导入数据库模型
from models.models import *
from config.point_map import point_map, table_map
from config.point_map import get_all_tablepoint


# 自定义JSON编码器，处理Decimal类型
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


echarts_router = APIRouter()


manager = ConnectionManager()


async def get_echarts_data(equ_name: str, class_shift: Shift):
    echarts_data = {}
    table_name_dict = await get_all_tablepoint(equ_name)
    table_name = table_name_dict["status"].split("_")[0]
    if "卷烟机" in equ_name:
        params, value = await execute_single_query("fault_counts", table_name+"_50011")
        echarts_data[params] = value
        logging.info(f"fault_counts:{value}")
    # 根据班次设置时间条件
    if class_shift == Shift.DAY.value:  # 早班
        time_condition = "startTime >= CONCAT(CURDATE(), ' 07:30:00') AND startTime < CONCAT(CURDATE(), ' 16:00:00')"
    elif class_shift == Shift.MID.value:  # 中班
        time_condition = "startTime >= CONCAT(CURDATE(), ' 16:00:00') AND startTime < CONCAT(CURDATE() + INTERVAL 1 DAY, ' 00:30:00')"
    elif class_shift == Shift.NIGHT.value:  # 晚班 (Shift.NIGHT)
        time_condition = "startTime >= CONCAT(CURDATE(), ' 00:30:00') AND startTime < CONCAT(CURDATE(), ' 07:30:00')"

    try:
        stop_half_sql = f"""
        SELECT
            text AS '故障名称',
            SUM(duration) AS '停机时长'
        FROM
            dc_stophistory
        WHERE
            mchCode = '{table_name}'
            AND {time_condition}
        GROUP BY
            text
        """

        stop_sort_sql = f"""
        SELECT
            text AS '故障名称',
            COUNT(text) AS '故障次数'
        FROM
            dc_stophistory
        WHERE
            mchCode = '{table_name}'
            AND {time_condition}
        GROUP BY
            text
        """

        # 并行执行两个查询以提高性能
        stop_half_result, sort_result = await asyncio.gather(
            query_mysql(stop_half_sql, shucai), query_mysql(stop_sort_sql, shucai)
        )

        echarts_data["stop_half"] = stop_half_result
        echarts_data["sort_result"] = sort_result
        # logging.info(f"stop_half_sql: {stop_half_sql}")
        # logging.info(f"stop_sort_sql: {stop_sort_sql}")
        # logging.info(echarts_data)
        logging.info(f"{table_name}班次数据获取成功")
        return echarts_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_echarts_data_all(query_params: QueryEchartsData):
    logging.info(query_params.start_time)
    logging.info(query_params.end_time)
    start_total_time = time.time()
    class_group = ""
    planstart_group = ""
    if query_params.class_group:
        class_group = f"AND classGroup = '{query_params.class_group.value}'"
        planstart_group = f"AND pl.planStartGroup = '{query_params.class_group.value}'"
    echarts_data_all = {}
    fault_counts_sql = f"""
        SELECT 
            DATE(haltDate) AS '日期',
            CASE
                WHEN classGroup = '01' THEN '甲班'
                WHEN classGroup = '02' THEN '乙班'
                WHEN classGroup = '03' THEN '丙班'
                ELSE classGroup
            END AS '班组',
            SUM(haltNumber) AS '停机次数'
        FROM 
            sfc_halt_record
        WHERE 
            workCenterName = '{query_params.equ_name}'
            AND haltDate >= '{query_params.start_time}'
            AND haltDate <= '{query_params.end_time}'
            {class_group}
        GROUP BY 
            DATE(haltDate),
            classGroup,
            workCenterName
    """
    production_sql = f"""
        SELECT
        DATE(pl.workDate) AS '日期',
        CASE
            WHEN pl.planStartGroup = '01' THEN '甲班'
            WHEN pl.planStartGroup = '02' THEN '乙班'
            WHEN pl.planStartGroup = '03' THEN '丙班'
            ELSE pl.planStartGroup
        END AS '班组名称',
        ROUND(SUM(pl.productAmount), 2) AS '产量(箱)'
        FROM
        pla_aps_workorder pl
        WHERE
        pl.workDate >= '{query_params.start_time}'
        AND pl.workDate <= '{query_params.end_time}'
        AND pl.workCenterName ='{query_params.equ_name}'
        AND pl.productAmount IS NOT NULL
        {planstart_group}
        GROUP BY
        DATE(pl.workDate),
        pl.planStartGroup
        ORDER BY
        DATE(pl.workDate) ASC,
        pl.planStartGroup ASC
    """
    bad_somke_sql = f"""
        SELECT
        DATE(pl.workDate) AS '日期',
        CASE
            WHEN pl.planStartGroup = '01' THEN '甲班'
            WHEN pl.planStartGroup = '02' THEN '乙班'
            WHEN pl.planStartGroup = '03' THEN '丙班'
            ELSE pl.planStartGroup
        END AS '班组',
        ROUND(SUM(pl.badCigar + pl.badPacker), 2) AS '坏烟数量(公斤)',
        ROUND(SUM(pl.badCigar + pl.badPacker) / SUM(pl.productAmount), 2) AS '坏烟单耗(公斤/箱)'
        FROM
        pla_aps_workorder pl
        WHERE
        pl.workDate >= '{query_params.start_time}'
        AND pl.workDate <= '{query_params.end_time}'
        AND pl.workCenterName ='{query_params.equ_name}'
        AND pl.productAmount IS NOT NULL
        {planstart_group}
        GROUP BY
        DATE(pl.workDate),
        pl.planStartGroup
        ORDER BY
        DATE(pl.workDate) ASC,
        pl.planStartGroup ASC
    """
    start_query_time = time.time()
    # 并行执行三个查询以提高性能
    fault_counts_result, production_result, bad_somke_result = await asyncio.gather(
        query_mysql(fault_counts_sql, mes),
        query_mysql(production_sql, mes),
        query_mysql(bad_somke_sql, mes),
    )
    end_query_time = time.time()
    query_duration = round(end_query_time - start_query_time, 2)

    echarts_data_all["fault_counts"] = fault_counts_result
    echarts_data_all["production"] = production_result
    echarts_data_all["bad_somke"] = bad_somke_result

    end_total_time = time.time()
    total_duration = round(end_total_time - start_total_time, 2)

    logging.info(fault_counts_sql)
    logging.info(f"数据库查询耗时：{query_duration}s")
    logging.info(f"总处理耗时：{total_duration}s")
    logging.info(f"{query_params.equ_name}设备数据获取成功")
    return echarts_data_all


@echarts_router.websocket("/ws/echarts")
async def websocket_endpoint(websocket: WebSocket, equ_name: str, class_shift: str):
    await manager.connect(websocket, equ_name)
    logging.info(f"{equ_name}设备已连接")

    try:
        while equ_name in manager.active_connections:
            try:
                await websocket.send_json({"type": "ping"})
            except WebSocketDisconnect:
                manager.disconnect(websocket, equ_name)
                logging.info(f"{equ_name}设备已断开连接")
                break

            data = await get_echarts_data(equ_name, class_shift)
            # logging.info(data)
            # if manager.compare_equipment_data(equ_name, data):
            #     manager.updata_equipment_data(equ_name, data)
            #     await manager.send_personal_message(
            #         json.dumps(data, cls=DecimalEncoder), equ_name
            #     )
            #     logging.info(f"{equ_name}设备数据已推送（数据有变化）")
            # else:
            #     logging.info(f"{equ_name}设备数据未变化,不推送")
            await manager.send_personal_message(
                json.dumps(data, cls=DecimalEncoder), equ_name
            )
            logging.info(f"{equ_name}设备数据已推送")
            await asyncio.sleep(5)

    except WebSocketDisconnect:
        manager.disconnect(websocket, equ_name)
        logging.info(f"{equ_name}设备已断开连接")

    except WebSocketException as e:
        manager.disconnect(websocket, equ_name)
        logging.info(f"{equ_name}设备已断开连接")
        raise HTTPException(status_code=500, detail=str(e))


@echarts_router.post(f"/echarts")
async def query_echarts_data(query_params: QueryEchartsData):
    data = await get_echarts_data_all(query_params)
    return data
