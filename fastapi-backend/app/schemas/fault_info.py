from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

class Shift(str, Enum):
    DAY = "早班"
    NIGHT = "晚班"
    MID = "中班"

class FaultInfo(BaseModel):
    mch_name: str  # 设备名称
    fault_time: datetime  # 故障发生时间（改为datetime类型）
    stop_time: str  # 停止时长（改为字符串类型）
    fault_name: str  # 故障名称
    mch_params: Dict[str, Any]  # 设备参数（改为字典类型）
    ai_analysis: str  # AI分析结果
    class_group: str  # 班组
    class_shift: Shift  # 班次（使用枚举限定选项）