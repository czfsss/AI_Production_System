from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime,time
from fastapi import APIRouter, HTTPException
# 导入模型和查询模型
from schemas.fault_info import *
# 导入数据库模型
from models.models import *


fault_router = APIRouter()

@fault_router.post(
    "/query_fault_history",
    response_model=List[FaultHistoryInfo],
    summary="查询历史故障记录"
)
async def query_fault_history(query: FaultQueryModel):
    # 构建查询条件
    query_conditions = {}
    # 日期范围筛选 - 修复点：将date转为完整datetime
    if query.start_date or query.end_date:
        # 初始化时间范围
        start_datetime = datetime.min
        end_datetime = datetime.max
        # 处理开始日期（扩展为当天的00:00:00）
        if query.start_date:
            start_datetime = datetime.combine(query.start_date, time.min)
        # 处理结束日期（扩展为当天的23:59:59）
        if query.end_date:
            end_datetime = datetime.combine(query.end_date, time.max)
        # 验证日期范围
        if query.start_date and query.end_date and end_datetime < start_datetime:
            raise HTTPException(status_code=400, detail="结束日期不能早于开始日期")
        # 添加日期范围条件
        query_conditions["fault_time__range"] = (start_datetime, end_datetime)

    # 班组筛选
    if query.class_group:
        query_conditions["class_group"] = query.class_group
    # 故障名称搜索
    if query.fault_name:
        query_conditions["fault_name__icontains"] = query.fault_name
    # 计算偏移量
    offset = (query.page - 1) * query.page_size
    # 构建排序条件
    sort_field = query.sort_by
    if query.sort_order == "desc":
        sort_field = f"-{sort_field}"
    # 执行查询
    faults = await FaultInfo.filter(**query_conditions).order_by(sort_field).offset(offset).limit(query.page_size)
    # 转换为响应模型
    result = [FaultHistoryInfo(**fault.__dict__) for fault in faults]
    return result