from pydantic import BaseModel
from datetime import datetime,date
from typing import Optional, Dict, Any
from enum import Enum

class QueryEquBending(BaseModel):
    equ_name: str

class ResponseEquStatus(BaseModel):
    equipment_status: str
