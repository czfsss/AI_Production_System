from pydantic import BaseModel
from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any
from enum import Enum
from schemas.fault_info import Group


class MGroup(str, Enum):
    A = "01"
    B = "02"
    C = "03"


class QueryEchartsData(BaseModel):
    equ_name: str
    class_group: MGroup | None = None
    start_time: Optional[date] = None
    end_time: Optional[date] = None

    def __init__(self, **data):
        super().__init__(**data)
        # 如果没有提供时间范围，默认设置为最近一个星期
        if self.start_time is None and self.end_time is None:
            self.end_time = date.today()
            self.start_time = self.end_time - timedelta(days=7)
