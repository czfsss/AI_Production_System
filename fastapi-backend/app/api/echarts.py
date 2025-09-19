from math import log
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, time
from fastapi import APIRouter, HTTPException
import logging  

# 导入模型和查询模型
from schemas.fault_info import *
from api.mysql_query import query_mysql

# 导入数据库模型
from models.models import *
from config.point_map import point_map, table_map
from config.point_map import get_all_tablepoint

echarts_router = APIRouter()


@echarts_router.get(f"/echarts")
async def get_echarts_data(equ_name: str):
    """
    获取Echarts数据的接口
    """
    try:

        # 构建SQL查询语句
        stop_half_sql = f"""
        SELECT
            text,
            SUM(duration)
        FROM
            dc_stophistory
        WHERE
            mchCode = {await get_all_tablepoint(equ_name)['status'].split('_')[0]}
            AND startTime >= CONCAT(CURDATE(), ' 07:30:00')
            AND startTime < CONCAT(CURDATE(), ' 16:00:00')
        GROUP BY
            text
        """

        stop_sort_sql = f"""
        SELECT
            text,
            COUNT(text)
        FROM
            dc_stophistory
        WHERE
            mchCode = {await get_all_tablepoint(equ_name)['status'].split('_')[0]}
            AND startTime >= CONCAT(CURDATE(), ' 07:30:00')
            AND startTime < CONCAT(CURDATE(), ' 16:00:00')
        GROUP BY
            text
        """

        # 执行查询
        stop_half_result = await query_mysql(stop_half_sql)
        sort_result = await query_mysql(stop_sort_sql)
        logging.info(f"stop_half_result: {stop_half_result}")
        logging.info(f"sort_result: {sort_result}")
        return stop_half_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
