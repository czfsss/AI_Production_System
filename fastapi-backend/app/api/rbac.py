from fastapi import APIRouter, Depends, HTTPException, Body
from models.models import User, Role, Permission, UserRole, RolePermission
from utils.dependencies import get_current_active_user, require_permissions
from schemas.rbac import RoleCreate, RoleUpdate, UserCreate, UserUpdate, PermissionAssign
from utils.auth_utils import auth_utils

rbac_router = APIRouter()

# --- Role Management ---

@rbac_router.get("/role/list")
async def role_list(current: int = 1, size: int = 20, roleName: str = None, roleCode: str = None):
    query = Role.all()
    if roleName:
        query = query.filter(name__contains=roleName)
    if roleCode:
        query = query.filter(code__contains=roleCode)
        
    total = await query.count()
    # Roles usually small number, but let's paginate if requested
    roles = await query.offset((current - 1) * size).limit(size)
    
    data = []
    for r in roles:
        data.append({
            "roleId": r.id,
            "roleName": r.name,
            "roleCode": r.code,
            "description": r.description,
            "enabled": r.enabled,
            "createTime": r.create_time.isoformat() if r.create_time else None
        })
    return {"records": data, "total": total, "current": current, "size": size}

@rbac_router.post("/role/add")
async def add_role(role: RoleCreate, current_user: User = Depends(require_permissions("user:edit"))):
    if await Role.filter(code=role.code).exists():
        raise HTTPException(status_code=400, detail="角色编码已存在")
    await Role.create(name=role.name, code=role.code, description=role.description, enabled=role.enabled)
    return {"message": "添加成功"}

@rbac_router.post("/role/update")
async def update_role(role: RoleUpdate, current_user: User = Depends(require_permissions("user:edit"))):
    r = await Role.get_or_none(id=role.roleId)
    if not r:
        raise HTTPException(status_code=404, detail="角色不存在")
    if role.name is not None: r.name = role.name
    if role.code is not None: r.code = role.code
    if role.description is not None: r.description = role.description
    if role.enabled is not None: r.enabled = role.enabled
    await r.save()
    return {"message": "更新成功"}

@rbac_router.post("/role/delete")
async def delete_role(roleId: int = Body(..., embed=True), current_user: User = Depends(require_permissions("user:edit"))):
    r = await Role.get_or_none(id=roleId)
    if not r:
        raise HTTPException(status_code=404, detail="角色不存在")
    if r.code in ["R_SUPER", "R_ADMIN", "R_USER"]:
        raise HTTPException(status_code=400, detail="系统内置角色不可删除")
    await r.delete()
    return {"message": "删除成功"}

@rbac_router.get("/role/permissions")
async def get_role_permissions(roleId: int):
    role = await Role.get_or_none(id=roleId)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    rps = await RolePermission.filter(role=role).prefetch_related("permission")
    # Return list of permission auth_marks
    return {"authMarks": [rp.permission.auth_mark for rp in rps]}

@rbac_router.post("/role/permissions/save")
async def save_role_permissions(data: PermissionAssign, current_user: User = Depends(require_permissions("user:edit"))):
    role = await Role.get_or_none(id=data.roleId)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # Clear existing permissions
    await RolePermission.filter(role=role).delete()
    
    # Add new permissions (create if not exists)
    for mark in data.authMarks:
        perm = await Permission.get_or_none(auth_mark=mark)
        if not perm:
            # Auto-create permission if it doesn't exist
            # We use mark as title as well since we don't have a separate title from frontend here
            perm = await Permission.create(title=mark, auth_mark=mark)
        
        await RolePermission.create(role=role, permission=perm)
            
    return {"message": "权限保存成功"}

# --- Permission Management ---

@rbac_router.get("/permission/list")
async def permission_list():
    perms = await Permission.all()
    # Transform to tree or list as needed. Frontend usually needs a list to select from.
    data = []
    for p in perms:
        data.append({
            "id": p.id,
            "label": p.title, 
            "auth_mark": p.auth_mark
        })
    return {"list": data}

# --- User Management ---

@rbac_router.get("/user/list")
async def user_list(current: int = 1, size: int = 20, userName: str = None, userPhone: str = None, status: int = None):
    query = User.all()
    if userName:
        query = query.filter(username__contains=userName)
    if userPhone:
        query = query.filter(phone__contains=userPhone)
    if status:
        query = query.filter(status=status)
    
    total = await query.count()
    users = await query.offset((current - 1) * size).limit(size)
    
    data = []
    for u in users:
        urs = await UserRole.filter(user=u).prefetch_related("role")
        role_names = [ur.role.name for ur in urs]
        data.append({
            "id": u.id,
            "userName": u.username,
            "nickName": u.nickname,
            "userPhone": u.phone,
            "userGender": u.gender,
            "avatar": u.avatar,
            "status": str(u.status),
            "createTime": u.create_time.isoformat() if u.create_time else None,
            "userRoles": role_names,
            "createBy": "system", # Placeholder
            "updateBy": "system", # Placeholder
            "updateTime": None
        })
    return {"records": data, "total": total, "current": current, "size": size}

@rbac_router.post("/user/add")
async def add_user(user: UserCreate, current_user: User = Depends(require_permissions("user:edit"))):
    if await User.filter(username=user.username).exists():
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    hashed_password = auth_utils.get_password_hash(user.password)
    u = await User.create(
        username=user.username,
        password=hashed_password,
        nickname=user.nickname,
        phone=user.phone,
        gender=user.gender,
        status=user.status
    )
    
    for rid in user.roleIds:
        role = await Role.get_or_none(id=rid)
        if role:
            await UserRole.create(user=u, role=role)
            
    return {"message": "用户创建成功"}

@rbac_router.post("/user/update")
async def update_user(user: UserUpdate, current_user: User = Depends(require_permissions("user:edit"))):
    u = await User.get_or_none(id=user.userId)
    if not u:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if user.nickname is not None: u.nickname = user.nickname
    if user.phone is not None: u.phone = user.phone
    if user.gender is not None: u.gender = user.gender
    if user.status is not None: u.status = user.status
    
    await u.save()
    
    if user.roleIds is not None:
        await UserRole.filter(user=u).delete()
        for rid in user.roleIds:
            role = await Role.get_or_none(id=rid)
            if role:
                await UserRole.create(user=u, role=role)
                
    return {"message": "用户更新成功"}

@rbac_router.post("/user/delete")
async def delete_user(userId: int = Body(..., embed=True), current_user: User = Depends(require_permissions("user:edit"))):
    u = await User.get_or_none(id=userId)
    if not u:
        raise HTTPException(status_code=404, detail="用户不存在")
    if u.username == "admin": # Prevent deleting super admin
         raise HTTPException(status_code=400, detail="超级管理员不可删除")
    await u.delete()
    return {"message": "用户删除成功"}
