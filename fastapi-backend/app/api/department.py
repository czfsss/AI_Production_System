from fastapi import APIRouter, HTTPException, Body, Depends
from models.models import Department, DepartmentPermission, Permission, User
from utils.dependencies import require_permissions
from tortoise.transactions import in_transaction

department_router = APIRouter()

@department_router.get("/list", summary="获取部门列表")
async def list_departments():
    items = await Department.all().order_by("id").values("id", "name", "code", "description", "enabled", "create_time")
    return {"records": items}

@department_router.post("/add", summary="新增部门")
async def add_department(item: dict):
    name = item.get("name")
    raw_code = item.get("code")
    code = (raw_code or "").strip() or None
    description = item.get("description")
    if not name:
        raise HTTPException(status_code=400, detail="部门名称不能为空")
    if await Department.filter(name=name).exists():
        raise HTTPException(status_code=400, detail="部门名称已存在")
    if code and await Department.filter(code=code).exists():
        raise HTTPException(status_code=400, detail="部门编码已存在")
    await Department.create(name=name, code=code, description=description)
    return {"message": "创建成功"}

@department_router.post("/update", summary="更新部门")
async def update_department(item: dict):
    dep_id = item.get("id")
    if not dep_id:
        raise HTTPException(status_code=400, detail="缺少id")
    dep = await Department.get_or_none(id=dep_id)
    if not dep:
        raise HTTPException(status_code=404, detail="部门不存在")
    name = item.get("name")
    raw_code = item.get("code")
    code = None if raw_code is None else ((raw_code or "").strip() or None)
    description = item.get("description")
    enabled = item.get("enabled")
    if name:
        if await Department.filter(name=name).exclude(id=dep_id).exists():
            raise HTTPException(status_code=400, detail="部门名称已存在")
        dep.name = name
    if raw_code is not None:
        if code and await Department.filter(code=code).exclude(id=dep_id).exists():
            raise HTTPException(status_code=400, detail="部门编码已存在")
        dep.code = code
    if description is not None:
        dep.description = description
    if enabled is not None:
        dep.enabled = bool(enabled)
    await dep.save()
    return {"message": "更新成功"}

@department_router.post("/delete", summary="删除部门")
async def delete_department(item: dict):
    dep_id = item.get("id")
    if not dep_id:
        raise HTTPException(status_code=400, detail="缺少id")
    async with in_transaction():
        dep = await Department.get_or_none(id=dep_id)
        if not dep:
            raise HTTPException(status_code=404, detail="部门不存在")
        await dep.delete()
    return {"message": "删除成功"}

@department_router.get("/permissions", summary="获取部门权限")
async def get_department_permissions(departmentId: int):
    dep = await Department.get_or_none(id=departmentId)
    if not dep:
        raise HTTPException(status_code=404, detail="部门不存在")
    dps = await DepartmentPermission.filter(department=dep).prefetch_related("permission")
    return {"authMarks": [dp.permission.auth_mark for dp in dps]}

@department_router.post("/permissions/save", summary="保存部门权限")
async def save_department_permissions(
    data: dict,
    current_user: User = Depends(require_permissions("user:edit"))
):
    department_id = data.get("departmentId")
    auth_marks = data.get("authMarks") or []
    dep = await Department.get_or_none(id=department_id)
    if not dep:
        raise HTTPException(status_code=404, detail="部门不存在")
    await DepartmentPermission.filter(department=dep).delete()
    for mark in auth_marks:
        perm = await Permission.get_or_none(auth_mark=mark)
        if not perm:
            perm = await Permission.create(title=mark, auth_mark=mark)
        await DepartmentPermission.create(department=dep, permission=perm)
    return {"message": "保存成功"}
