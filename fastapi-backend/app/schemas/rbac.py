from pydantic import BaseModel
from typing import Optional, List

class RoleCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    enabled: bool = True

class RoleUpdate(BaseModel):
    roleId: int
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None

class UserCreate(BaseModel):
    username: str
    password: str
    real_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    department: Optional[str] = None
    status: int = 1
    roleIds: List[int] = []

class UserUpdate(BaseModel):
    userId: int
    username: Optional[str] = None
    real_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    department: Optional[str] = None
    status: Optional[int] = None
    roleIds: Optional[List[int]] = None
