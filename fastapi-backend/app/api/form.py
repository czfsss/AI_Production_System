from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional
from tortoise.expressions import Q
from models.models import Form, FormSubmission, User
from schemas.form import (
    FormCreate, 
    FormUpdate, 
    FormResponse, 
    FormListResponse, 
    FormSubmissionCreate, 
    FormSubmissionResponse
)
from utils.dependencies import get_current_user, get_current_user_optional

form_router = APIRouter()

@form_router.post("/create", response_model=FormResponse, summary="创建表单")
async def create_form(form: FormCreate, current_user: User = Depends(get_current_user)):
    form_obj = await Form.create(**form.dict(), creator=current_user)
    # 确保返回值包含 creator 的完整信息，满足响应模型
    await form_obj.fetch_related("creator")
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

@form_router.get("/public/{uuid}", response_model=FormResponse, summary="获取公开表单详情")
async def get_public_form(uuid: str):
    form = await Form.get_or_none(uuid=uuid).select_related("creator")
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    return form

@form_router.post("/submit/{uuid}", response_model=FormSubmissionResponse, summary="提交表单")
async def submit_form(uuid: str, submission: FormSubmissionCreate, current_user: Optional[User] = Depends(get_current_user_optional)):
    """
    提交表单数据
    - uuid: 表单UUID
    - submission: 填报数据
    """
    form = await Form.get_or_none(uuid=uuid)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    
    submission_obj = await FormSubmission.create(
        form=form,
        data=submission.data,
        user=current_user if current_user else None,
        is_draft=False
    )
    # 如果是登录用户提交，则尝试删除其在该表单的草稿记录
    # 这里删除条件为：同一用户、同一表单、标记为草稿的记录
    if current_user:
        await FormSubmission.filter(form=form, user=current_user, is_draft=True).delete()
    return submission_obj

@form_router.get("/{id}/submissions", response_model=List[FormSubmissionResponse], summary="获取表单提交记录")
async def get_form_submissions(id: int, current_user: User = Depends(get_current_user)):
    """
    获取指定表单的提交记录
    """
    form = await Form.get_or_none(id=id)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    
    # 权限检查：非管理员且不是创建者，无法查看数据
    # 假设 User 有 is_admin 属性或者根据角色判断，这里暂且只检查创建者
    # if form.creator_id != current_user.id: ...
    
    submissions = await FormSubmission.filter(form=form).select_related("user").order_by("-create_time")
    return submissions

@form_router.post("/draft/{uuid}", response_model=FormSubmissionResponse, summary="暂存表单")
async def save_draft(uuid: str, submission: FormSubmissionCreate, current_user: User = Depends(get_current_user)):
    """
    暂存表单数据（需要登录）
    - 如果当前用户已存在草稿，则更新草稿
    - 否则创建新的草稿
    """
    form = await Form.get_or_none(uuid=uuid)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")

    # 查找当前用户的草稿
    draft = await FormSubmission.get_or_none(form=form, user=current_user, is_draft=True)
    if draft:
        draft.data = submission.data
        draft.is_draft = True
        await draft.save()
        await draft.fetch_related("user")
        return draft
    else:
        submission_obj = await FormSubmission.create(
            form=form,
            data=submission.data,
            user=current_user,
            is_draft=True
        )
        await submission_obj.fetch_related("user")
        return submission_obj

@form_router.get("/draft/{uuid}", response_model=FormSubmissionResponse, summary="获取当前用户草稿")
async def get_draft(uuid: str, current_user: User = Depends(get_current_user)):
    """
    获取当前登录用户在指定表单的草稿（需要登录）
    - 若存在草稿，返回草稿记录
    - 若不存在，返回 404
    """
    form = await Form.get_or_none(uuid=uuid)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")

    draft = await FormSubmission.get_or_none(form=form, user=current_user, is_draft=True)
    if not draft:
        raise HTTPException(status_code=404, detail="草稿不存在")

    await draft.fetch_related("user")
    return draft

@form_router.put("/{id}", response_model=FormResponse, summary="更新表单")
async def update_form(id: int, form_data: FormUpdate, current_user: User = Depends(get_current_user)):
    form = await Form.get_or_none(id=id)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    
    await form.update_from_dict(form_data.dict(exclude_unset=True))
    await form.save()
    # 补充加载 creator 关系，避免返回响应校验错误
    await form.fetch_related("creator")
    return form

@form_router.delete("/{id}", summary="删除表单")
async def delete_form(id: int, current_user: User = Depends(get_current_user)):
    form = await Form.get_or_none(id=id)
    if not form:
        raise HTTPException(status_code=404, detail="表单不存在")
    
    await form.delete()
    return {"message": "删除成功"}
