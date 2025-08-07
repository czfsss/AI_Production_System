from pydantic import BaseModel
from datetime import datetime,date
from typing import Optional, Dict, Any
from enum import Enum

class Shift(str, Enum):
    DAY = "早班"
    NIGHT = "晚班"
    MID = "中班"
    
class Group(str, Enum):
    A = "甲班"
    B = "乙班"   
    C = "丙班"

class FaultHistoryInfo(BaseModel):
    mch_name: str  # 设备名称
    fault_time: datetime  # 故障发生时间（改为datetime类型）
    stop_time: str  # 停止时长（改为字符串类型）
    fault_name: str  # 故障名称
    mch_params: Dict[str, Any]  # 设备参数（改为字典类型）
    ai_analysis: str  # AI分析结果
    class_group: Group  # 班组（使用枚举限定选项）
    class_shift: Shift  # 班次（使用枚举限定选项）
    
class FaultQueryModel(BaseModel):
    # 日期范围筛选
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    # 班组筛选
    class_group: Optional[Group] = None
    # 故障名称搜索
    fault_name: Optional[str] = None
    # 分页参数
    page: int = 1
    page_size: int = 10
    # 排序参数
    sort_by: str = "fault_time"
    sort_order: str = "desc"