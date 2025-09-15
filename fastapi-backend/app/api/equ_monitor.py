from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, time
from fastapi import APIRouter, HTTPException
import taosrest
from config import tdengine_config

# 导入模型和查询模型
from schemas.equ_bending import *


equ_bending_router = APIRouter()

@equ_bending_router.post('/equbending',response_model=ResponseEquStatus)
async def equ_bending(equname:QueryEquBending):
    client = None
    try:
        client = taosrest.RestClient(
            url=tdengine_config.host, user=tdengine_config.user, password=tdengine_config.password, timeout=30
        )
        sql = f"SELECT * FROM hysc.{equname.equ_name} order by ts desc limit 1"
        result = client.sql(sql)
        if result["data"]:
            return ResponseEquStatus(equ_status=result["data"][0][1])

    except Exception as err:
        print(f"Failed to query data from power.meters, sql: {sql}, ErrMessage:{err}")
    
