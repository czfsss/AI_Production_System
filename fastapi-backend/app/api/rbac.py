"""
RBAC（基于角色的访问控制）相关接口。

主要功能：
- 角色管理：查询、新增、更新、删除、权限分配
- 权限管理：权限列表
- 用户管理：查询、新增、更新、删除、分配角色

安全约束：
- 涉及超级管理员（角色代码 `R_SUPER` 或拥有该角色的用户）的增删改，只有当前登录用户为超级管理员时才允许操作。
- 其他管理员仅能管理非超级管理员角色和非超级管理员用户。
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from models.models import User, Role, UserRole, Department, RoleMenu, Menu
from utils.dependencies import get_current_active_user, require_permissions
from schemas.rbac import RoleCreate, RoleUpdate, UserCreate, UserUpdate
from utils.auth_utils import auth_utils

rbac_router = APIRouter()

# --- Role Management ---

@rbac_router.get("/role/list", summary="角色列表")
async def role_list(current: int = 1, size: int = 20, roleName: str = None, roleCode: str = None):
    """
    角色分页列表查询。

    参数：
    - `current`: 当前页码
    - `size`: 每页条数
    - `roleName`: 角色名称模糊匹配
    - `roleCode`: 角色编码模糊匹配

    返回：
    - `records`: 角色数据列表
    - `total`: 总条数
    - `current`: 当前页
    - `size`: 每页大小
    """
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

@rbac_router.post("/role/add", summary="新增角色")
async def add_role(role: RoleCreate, current_user: User = Depends(require_permissions("user:edit"))):
    """
    新增角色。

    约束：
    - 角色编码唯一
    - 需要 `user:edit` 权限
    """
    if await Role.filter(code=role.code).exists():
        raise HTTPException(status_code=400, detail="角色编码已存在")
    await Role.create(name=role.name, code=role.code, description=role.description, enabled=role.enabled)
    return {"message": "添加成功"}

@rbac_router.post("/role/update", summary="更新角色")
async def update_role(role: RoleUpdate, current_user: User = Depends(require_permissions("user:edit"))):
    """
    更新角色基础信息。

    安全：
    - 当目标角色为 `R_SUPER` 时，只有当前登录用户具有 `R_SUPER` 角色才能修改。
    """
    r = await Role.get_or_none(id=role.roleId)
    if not r:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # Check super admin permission
    if r.code == "R_SUPER":
        if not await UserRole.filter(user=current_user, role__code="R_SUPER").exists():
            raise HTTPException(status_code=403, detail="只有超级管理员可以修改超级管理员角色")

    if role.name is not None: r.name = role.name
    if role.code is not None: r.code = role.code
    if role.description is not None: r.description = role.description
    if role.enabled is not None: r.enabled = role.enabled
    await r.save()
    return {"message": "更新成功"}

@rbac_router.post("/role/delete", summary="删除角色")
async def delete_role(roleId: int = Body(..., embed=True), current_user: User = Depends(require_permissions("user:edit"))):
    """
    删除角色。

    约束：
    - 系统内置角色（`R_SUPER`, `R_ADMIN`, `R_USER`）不可删除。
    - 需要 `user:edit` 权限。
    """
    r = await Role.get_or_none(id=roleId)
    if not r:
        raise HTTPException(status_code=404, detail="角色不存在")
    if r.code in ["R_SUPER", "R_ADMIN", "R_USER"]:
        raise HTTPException(status_code=400, detail="系统内置角色不可删除")
    await r.delete()
    return {"message": "删除成功"}

@rbac_router.get("/role/permissions", summary="获取角色权限")
async def get_role_permissions(roleId: int):
    """
    获取指定角色的菜单权限ID列表。
    """
    role = await Role.get_or_none(id=roleId)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # Get all Menu IDs assigned to this role
    rms = await RoleMenu.filter(role=role).values_list("menu_id", flat=True)
    
    # Return list of menu IDs (frontend tree needs selected keys)
    return {"menuIds": list(rms)}

@rbac_router.post("/role/permissions/save", summary="保存角色权限")
async def save_role_permissions(data: dict = Body(...), current_user: User = Depends(require_permissions("user:edit"))):
    """
    保存角色的菜单权限分配。
    
    参数:
    - roleId: 角色ID
    - menuIds: 菜单ID列表 (包含菜单和按钮)
    
    行为：
    - 清空角色原有菜单权限
    - 为传入的 `menuIds` 创建记录
    
    安全：
    - 如目标角色为 `R_SUPER`，仅超级管理员可修改其权限。
    """
    role_id = data.get("roleId")
    menu_ids = data.get("menuIds", [])
    
    role = await Role.get_or_none(id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="角色不存在")
    
    # Check super admin permission
    if role.code == "R_SUPER":
        if not await UserRole.filter(user=current_user, role__code="R_SUPER").exists():
            raise HTTPException(status_code=403, detail="只有超级管理员可以修改超级管理员权限")
    
    # Clear existing permissions (RoleMenu)
    await RoleMenu.filter(role=role).delete()
    
    # Add new permissions
    for mid in menu_ids:
        menu = await Menu.get_or_none(id=mid)
        if menu:
            await RoleMenu.create(role=role, menu=menu)
            
    return {"message": "权限保存成功"}

# --- User Management ---

@rbac_router.get("/user/list", summary="用户列表")
async def user_list(current: int = 1, size: int = 20, userName: str = None, userPhone: str = None, status: int = None):
    """
    用户分页列表查询。

    参数：
    - `current`: 当前页
    - `size`: 每页数量
    - `userName`: 用户名模糊查询
    - `userPhone`: 手机号模糊查询
    - `status`: 状态过滤
    """
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
            "realName": u.real_name,
            "userPhone": u.phone,
            "userGender": u.gender,
            "department": u.department,
            "status": str(u.status),
            "createTime": u.create_time.isoformat() if u.create_time else None,
            "userRoles": role_names,
            "createBy": "system", # Placeholder
            "updateBy": "system", # Placeholder
            "updateTime": None
        })
    return {"records": data, "total": total, "current": current, "size": size}

@rbac_router.post("/user/add", summary="新增用户")
async def add_user(user: UserCreate, current_user: User = Depends(require_permissions("user:edit"))):
    """
    新增用户并分配角色。

    约束：
    - 用户名唯一
    - 部门存在校验（如有传入）
    - 分配 `R_SUPER` 角色时需由超级管理员执行
    """
    if await User.filter(username=user.username).exists():
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    if user.department and not await Department.filter(name=user.department).exists():
        raise HTTPException(status_code=400, detail="部门不存在")

    hashed_password = auth_utils.get_password_hash(user.password)
    u = await User.create(
        username=user.username,
        password=hashed_password,
        real_name=user.real_name,
        phone=user.phone,
        gender=user.gender,
        department=user.department,
        status=user.status
    )
    
    for rid in user.roleIds:
        role = await Role.get_or_none(id=rid)
        if role:
            if role.code == "R_SUPER":
                if not await UserRole.filter(user=current_user, role__code="R_SUPER").exists():
                    raise HTTPException(status_code=403, detail="只有超级管理员可以分配超级管理员角色")
            await UserRole.create(user=u, role=role)
            
    return {"message": "用户创建成功"}

@rbac_router.post("/user/update", summary="更新用户")
async def update_user(user: UserUpdate, current_user: User = Depends(require_permissions("user:edit"))):
    """
    更新用户信息及角色。

    安全：
    - 当目标用户包含 `R_SUPER` 角色时，仅超级管理员可更新。
    - 分配 `R_SUPER` 角色需超级管理员权限。
    """
    u = await User.get_or_none(id=user.userId)
    if not u:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # Check if target is super admin
    if await UserRole.filter(user=u, role__code="R_SUPER").exists():
        if not await UserRole.filter(user=current_user, role__code="R_SUPER").exists():
            raise HTTPException(status_code=403, detail="只有超级管理员可以修改超级管理员信息")
    
    if user.real_name is not None: u.real_name = user.real_name
    if user.phone is not None: u.phone = user.phone
    if user.gender is not None: u.gender = user.gender
    if user.department is not None:
        if user.department and not await Department.filter(name=user.department).exists():
             raise HTTPException(status_code=400, detail="部门不存在")
        u.department = user.department
    if user.status is not None: u.status = user.status
    
    await u.save()
    
    if user.roleIds is not None:
        await UserRole.filter(user=u).delete()
        for rid in user.roleIds:
            role = await Role.get_or_none(id=rid)
            if role:
                if role.code == "R_SUPER":
                    if not await UserRole.filter(user=current_user, role__code="R_SUPER").exists():
                        raise HTTPException(status_code=403, detail="只有超级管理员可以分配超级管理员角色")
                await UserRole.create(user=u, role=role)
                
    return {"message": "用户更新成功"}

@rbac_router.post("/user/delete", summary="删除用户")
async def delete_user(userId: int = Body(..., embed=True), current_user: User = Depends(require_permissions("user:edit"))):
    """
    删除用户。

    安全：
    - `admin` 用户禁止删除（系统保留）
    - 拥有 `R_SUPER` 角色的用户，仅超级管理员可删除
    """
    u = await User.get_or_none(id=userId)
    if not u:
        raise HTTPException(status_code=404, detail="用户不存在")
    if u.username == "admin": # Prevent deleting super admin
         raise HTTPException(status_code=400, detail="超级管理员不可删除")
    
    # Check if target is super admin
    if await UserRole.filter(user=u, role__code="R_SUPER").exists():
         if not await UserRole.filter(user=current_user, role__code="R_SUPER").exists():
             raise HTTPException(status_code=403, detail="只有超级管理员可以删除超级管理员")
             
    await u.delete()
    return {"message": "用户删除成功"}
