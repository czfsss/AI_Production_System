from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from tortoise.expressions import Q
from models.models import Form, User
from schemas.form import FormCreate, FormUpdate, FormResponse, FormListResponse
from utils.dependencies import get_current_user

form_router = APIRouter()

@form_router.post("/create", response_model=FormResponse, summary="创建表单")
async def create_form(form: FormCreate, current_user: User = Depends(get_current_user)):
    form_obj = await Form.create(**form.dict(), creator=current_user)
    return form_obj

@form_router.get("/list", response_model=FormListResponse, summary="获取表单列表")
async def get_form_list(
    page: int = 1, 
    size: int = 10, 
    name: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = Form.all()
    if name:
        query = query.filter(Q(name__icontains=name) | Q(creator__real_name__icontains=name))
    
    total = await query.count()
    items = await query.select_related("creator").offset((page - 1) * size).limit(size).order_by("-create_time")
    
    return {"total": total, "items": items}

@form_router.get("/{id}", response_model=FormResponse, summary="获取表单详情")
async def get_form(id: int, current_user: User = Depends(get_current_user)):
    form = await Form.get_or_none(id=id).select_related("creator")
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    return form

@form_router.get("/public/{id}", response_model=FormResponse, summary="获取公开表单详情")
async def get_public_form(id: int):
    form = await Form.get_or_none(id=id).select_related("creator")
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    return form

@form_router.put("/{id}", response_model=FormResponse, summary="更新表单")
async def update_form(id: int, form_data: FormUpdate, current_user: User = Depends(get_current_user)):
    form = await Form.get_or_none(id=id)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    
    await form.update_from_dict(form_data.dict(exclude_unset=True))
    await form.save()
    return form

@form_router.delete("/{id}", summary="删除表单")
async def delete_form(id: int, current_user: User = Depends(get_current_user)):
    form = await Form.get_or_none(id=id)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    
    await form.delete()
    return {"message": "删除成功"}
