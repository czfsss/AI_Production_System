"""
用户与认证相关接口。

功能概览：
- 注册、登录、刷新令牌、退出登录
- 获取当前用户信息、更新资料、修改姓名、修改/重置密码
- RBAC 聚合：登录与资料接口会返回角色代码与权限标识列表，供前端控制菜单与操作权限

设计要点：
- `ensure_defaults` 在首次使用时确保基础角色与权限存在
- `get_user_rbac` 统一聚合用户角色与权限（含部门权限合并）
"""
from fastapi import APIRouter, Request, HTTPException, Depends, status
from fastapi import Body
from schemas.user import *
from models.models import *
from utils.auth_utils import auth_utils
from utils.dependencies import get_current_active_user
from datetime import datetime
import os
import time


user_router = APIRouter()

async def ensure_defaults():
    """
    初始化基础角色：
    - 创建 `R_SUPER`、`R_ADMIN`、`R_USER` 三个角色（如不存在）
    说明：在系统冷启动或无数据时，保证最小可用的 RBAC 基础数据。
    """
    if not await Role.filter(code="R_SUPER").exists():
        await Role.create(name="Super Admin", code="R_SUPER")
    if not await Role.filter(code="R_ADMIN").exists():
        await Role.create(name="Admin", code="R_ADMIN")
    if not await Role.filter(code="R_USER").exists():
        await Role.create(name="User", code="R_USER")

async def get_user_rbac(username: str):
    """
    计算并返回用户的角色代码列表与权限标识集合。

    逻辑：
    - 若用户尚未分配任何角色，则根据用户名规则分配一个默认角色
    - 汇总角色权限与部门权限，去重后返回
    返回：
    - `(role_codes, marks)` 角色代码列表与权限标识列表
    """
    await ensure_defaults()
    user = await User.get(username=username)
    uroles = await UserRole.filter(user=user).prefetch_related("role")
    role_codes = [ur.role.code for ur in uroles]
    if not role_codes:
        # 兜底逻辑：如果用户没有任何角色，默认分配 R_USER
        # 仅保留 admin 账号的自动提权作为系统救援通道
        if username == "admin":
            role = await Role.get(code="R_SUPER")
        else:
            role = await Role.get(code="R_USER")
        await UserRole.create(user=user, role=role)
        role_codes = [role.code]
    
    # 获取角色对应的菜单权限 (包含菜单和按钮)
    role_menu_ids = await RoleMenu.filter(role__code__in=role_codes).values_list("menu_id", flat=True)
    role_menus = await Menu.filter(id__in=list(role_menu_ids)).exclude(permission__isnull=True)
    role_marks = [m.permission for m in role_menus if m.permission]

    dep_marks = []
    if user.department:
        dep = await Department.get_or_none(name=user.department)
        if dep:
            # 获取部门对应的菜单权限 (仅限查看权限，即 type="menu")
            dep_menu_ids = await DepartmentMenu.filter(department=dep).values_list("menu_id", flat=True)
            dep_menus = await Menu.filter(id__in=list(dep_menu_ids), type="menu").exclude(permission__isnull=True)
            dep_marks = [m.permission for m in dep_menus if m.permission]
            
    marks = list(set(role_marks) | set(dep_marks))
    return role_codes, marks


# 注册
@user_router.post(
    "/register",
    response_model=TokenResponseModel,
    summary="注册",
)
async def register(item: RegisterModel):
    """
    用户注册。

    规则：
    - 两次密码一致校验
    - 用户名唯一校验
    - 部门存在校验
    行为：
    - 创建用户并默认分配 `R_USER` 角色
    - 生成并返回令牌与用户信息（含角色与权限）
    """
    # 判断两次密码是否一致
    if item.password != item.confirm_password:
        raise HTTPException(status_code=400, detail="两次输入的密码不一致！")
    # 检查用户名是否已存在
    if await User.filter(username=item.username).exists():
        raise HTTPException(status_code=400, detail="用户名已存在！")

    # 检查部门是否存在
    if not await Department.filter(name=item.department).exists():
        raise HTTPException(status_code=400, detail="部门不存在！")

    # 对密码进行哈希处理
    hashed_password = auth_utils.get_password_hash(item.password)

    # 进行注册
    user = User(
        username=item.username,
        password=hashed_password,
        real_name=item.real_name,
        department=item.department,
    )
    await user.save()

    await ensure_defaults()
    await UserRole.create(user=user, role=await Role.get(code="R_USER"))
    # 创建JWT令牌
    tokens = auth_utils.create_token_pair(user.username)

    # 返回用户信息和令牌
    role_codes, marks = await get_user_rbac(user.username)
    user_info = LoginResponseModel(
        username=user.username,
        real_name=user.real_name,
        create_time=user.create_time.isoformat() if user.create_time else None,
        roles=role_codes,
        permissions=marks,
        department=user.department,
        phone=user.phone,
        gender=user.gender,
        status=user.status,
    )

    return TokenResponseModel(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        user_info=user_info,
    )


@user_router.post(
    "/login",
    response_model=TokenResponseModel,
    summary="登录",
)
async def login(item: LoginModel):
    """
    用户登录。

    规则：
    - 校验账号密码
    行为：
    - 生成令牌对并返回用户信息、角色与权限
    """
    # 根据用户名获取用户
    user = await User.get_or_none(username=item.username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="账号或密码错误！"
        )

    # 验证密码
    if not auth_utils.verify_password(item.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="账号或密码错误！"
        )

    # 创建JWT令牌
    tokens = auth_utils.create_token_pair(user.username)

    # 返回用户信息和令牌
    role_codes, marks = await get_user_rbac(user.username)
    user_info = LoginResponseModel(
        username=user.username,
        real_name=user.real_name,
        create_time=user.create_time.isoformat() if user.create_time else None,
        roles=role_codes,
        permissions=marks,
        department=user.department,
        phone=user.phone,
        gender=user.gender,
        status=user.status,
    )

    return TokenResponseModel(
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        token_type=tokens["token_type"],
        user_info=user_info,
    )


@user_router.get(
    "/profile", response_model=LoginResponseModel, summary="获取当前用户信息"
)
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    获取当前登录用户的信息。

    返回：基本个人信息 + 角色列表 + 权限标识列表。
    """
    role_codes, marks = await get_user_rbac(current_user.username)
    return LoginResponseModel(
        username=current_user.username,
        real_name=current_user.real_name,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        roles=role_codes,
        permissions=marks,
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        status=current_user.status,
    )


# 修改密码
@user_router.post(
    "/update_password",
    response_model=LoginResponseModel,
    summary="修改密码",
)
async def update_password(
    item: UpdatePasswordModel, current_user: User = Depends(get_current_active_user)
):
    """
    修改当前用户密码。

    支持两种模式：
    - 修改密码：需要提供旧密码并验证
    - 重置密码：不需要旧密码（通常由管理或安全流程触发）
    统一返回更新后的用户资料。
    """
    # 判断两次密码是否一致
    if item.new_password != item.confirm_password:
        raise HTTPException(status_code=400, detail="两次输入的密码不一致！")

    # 根据是否有old_password判断是修改密码还是重置密码
    if item.old_password is not None:
        # 修改密码逻辑：需要验证旧密码
        if not auth_utils.verify_password(item.old_password, current_user.password):
            raise HTTPException(status_code=400, detail="旧密码错误！")
        # 判断新密码是否与旧密码相同
        if auth_utils.verify_password(item.new_password, current_user.password):
            raise HTTPException(status_code=400, detail="新密码不能与旧密码相同！")
    else:
        # 重置密码逻辑：不需要验证旧密码（需要管理员权限或其他验证方式）
        # 判断新密码是否与当前密码相同
        if auth_utils.verify_password(item.new_password, current_user.password):
            raise HTTPException(status_code=400, detail="新密码不能与当前密码相同！")

    # 对新密码进行哈希处理
    hashed_password = auth_utils.get_password_hash(item.new_password)

    # 更新密码
    current_user.password = hashed_password
    await current_user.save()

    return LoginResponseModel(
        username=current_user.username,
        real_name=current_user.real_name,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        status=current_user.status,
    )


# 刷新令牌
@user_router.post(
    "/refresh",
    response_model=TokenResponseModel,
    summary="刷新访问令牌",
)
async def refresh_token(item: RefreshTokenModel):
    """
    使用刷新令牌获取新的访问令牌。

    规则：
    - 校验刷新令牌合法性与类型
    - 验证用户存在
    行为：
    - 返回新的令牌对与用户信息（含角色与权限）
    """
    try:
        # 验证刷新令牌
        payload = auth_utils.verify_token(item.refresh_token)

        # 检查令牌类型
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的刷新令牌"
            )

        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的刷新令牌"
            )

        # 验证用户是否存在
        user = await User.get_or_none(username=username)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在"
            )

        # 创建新的令牌对
        tokens = auth_utils.create_token_pair(username)

        # 返回用户信息和新令牌
        role_codes, marks = await get_user_rbac(user.username)
        user_info = LoginResponseModel(
            username=user.username,
            real_name=user.real_name,
            create_time=user.create_time.isoformat() if user.create_time else None,
            roles=role_codes,
            permissions=marks,
            department=user.department,
            phone=user.phone,
            gender=user.gender,
            status=user.status,
        )

        return TokenResponseModel(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            user_info=user_info,
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="无效的刷新令牌"
        )


# 修改姓名
@user_router.post(
    "/update_real_name",
    response_model=LoginResponseModel,
    summary="修改姓名",
)
async def update_real_name(
    item: UpdateRealNameModel, current_user: User = Depends(get_current_active_user)
):
    """
    修改当前用户的真实姓名，并返回最新资料与权限聚合。
    """
    # 更新姓名
    current_user.real_name = item.real_name
    await current_user.save()

    role_codes, marks = await get_user_rbac(current_user.username)
    return LoginResponseModel(
        username=current_user.username,
        real_name=current_user.real_name,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        roles=role_codes,
        permissions=marks,
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        status=current_user.status,
    )

@user_router.post("/update_profile", response_model=LoginResponseModel, summary="更新资料")
async def update_profile(
    phone: Optional[str] = Body(None),
    gender: Optional[str] = Body(None),
    department: Optional[str] = Body(None),
    current_user: User = Depends(get_current_active_user),
):
    """
    更新当前用户的资料（手机号/性别/部门）。

    仅修改传入的非空字段；返回更新后的资料与权限聚合。
    """
    changed = False
    if phone is not None:
        current_user.phone = phone
        changed = True
    if gender is not None:
        current_user.gender = gender
        changed = True
    if department is not None:
        current_user.department = department
        changed = True
    if changed:
        await current_user.save()
    role_codes, marks = await get_user_rbac(current_user.username)
    return LoginResponseModel(
        username=current_user.username,
        real_name=current_user.real_name,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        roles=role_codes,
        permissions=marks,
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        status=current_user.status,
    )

 


# 重置密码（通过安全问题）
@user_router.post(
    "/reset_password",
    response_model=LoginResponseModel,
    summary="重置密码",
)
async def reset_password(item: ResetPasswordModel):
    """
    通过安全问题重置密码。

    规则：
    - 用户存在校验
    - 新密码不可与当前密码相同
    行为：
    - 更新密码并返回最新资料与权限聚合
    """
    # 根据用户名获取用户
    user = await User.get_or_none(username=item.username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在！"
        )

    # 安全问题答案验证在模型中已经完成
    # 判断新密码是否与当前密码相同
    if auth_utils.verify_password(item.new_password, user.password):
        raise HTTPException(status_code=400, detail="新密码不能与当前密码相同！")

    # 对新密码进行哈希处理
    hashed_password = auth_utils.get_password_hash(item.new_password)

    # 更新密码
    user.password = hashed_password
    await user.save()

    role_codes, marks = await get_user_rbac(user.username)
    return LoginResponseModel(
        username=user.username,
        real_name=user.real_name,
        create_time=(user.create_time.isoformat() if user.create_time else None),
        roles=role_codes,
        permissions=marks,
        department=user.department,
        phone=user.phone,
        gender=user.gender,
        status=user.status,
    )


# 退出登录
@user_router.post("/logout", summary="退出登录")
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    退出登录（后端无状态，令牌由前端删除）。
    """
    return {"message": "退出登录成功"}
