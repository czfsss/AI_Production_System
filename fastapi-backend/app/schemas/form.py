from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class FormBase(BaseModel):
    name: str = Field(..., description="表单名称")
    description: Optional[str] = Field(None, description="表单描述")
    schema: Dict[str, Any] = Field(..., description="表单结构JSON")

class FormCreate(FormBase):
    pass

class FormUpdate(BaseModel):
    name: Optional[str] = Field(None, description="表单名称")
    description: Optional[str] = Field(None, description="表单描述")
    schema: Optional[Dict[str, Any]] = Field(None, description="表单结构JSON")

class CreatorInfo(BaseModel):
    id: int = Field(..., description="用户ID")
    real_name: str = Field(..., description="真实姓名")

class FormResponse(FormBase):
    id: int = Field(..., description="表单ID")
    uuid: UUID = Field(..., description="表单唯一标识")
    create_time: datetime = Field(..., description="创建时间")
    update_time: datetime = Field(..., description="更新时间")
    creator: Optional[CreatorInfo] = Field(None, description="创建者信息")
    creator_id: Optional[int] = Field(None, description="创建者ID")

    class Config:
        from_attributes = True

class FormSubmissionCreate(BaseModel):
    data: Dict[str, Any] = Field(..., description="填报数据")
    is_draft: bool = Field(False, description="是否草稿")

class SubmitterInfo(BaseModel):
    id: int
    real_name: str

class FormSubmissionResponse(BaseModel):
    id: int
    form_id: int
    data: Dict[str, Any]
    create_time: datetime
    update_time: datetime
    is_draft: bool
    user_id: Optional[int] = None
    user: Optional[SubmitterInfo] = None
    
    class Config:
        from_attributes = True

class FormListResponse(BaseModel):
    total: int
    items: List[FormResponse]
