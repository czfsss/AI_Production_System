from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, time
from fastapi import APIRouter, HTTPException
# 导入模型和查询模型
from schemas.fault_info import *

# 导入数据库模型
from models.models import *


fault_router = APIRouter()


