from math import log
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, time
from fastapi import APIRouter, HTTPException
import taosrest
from config import tdengine_config, point_map
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)

# 导入模型和查询模型
from schemas.equ_bending import *


equ_bending_router = APIRouter()


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

            sql = f"SELECT * FROM hysc.s{point_map.point[equname.equ_name]}_60010 order by ts desc limit 1"

            result = client.sql(sql)
            if result["data"]:
                result = result["data"][0][1]
                logging.info(result)
                return ResponseEquStatus(equipment_status=result)
        elif "包装机" in equname.equ_name:
            sql = f"SELECT * FROM hysc.s{point_map.point[equname.equ_name]}_60028 order by ts desc limit 1"
            sql1 = f"SELECT * FROM hysc.s{point_map.point[equname.equ_name]}_60048 order by ts desc limit 1"
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
        return HTTPException(
            status_code=500,
            detail=f"Failed to query data from power.meters, sql: {sql}, ErrMessage:{err}",
        )
