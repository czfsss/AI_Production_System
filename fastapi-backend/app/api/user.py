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
    if not await Role.filter(code="R_SUPER").exists():
        await Role.create(name="Super Admin", code="R_SUPER")
    if not await Role.filter(code="R_ADMIN").exists():
        await Role.create(name="Admin", code="R_ADMIN")
    if not await Role.filter(code="R_USER").exists():
        await Role.create(name="User", code="R_USER")
    marks = [("新增", "add"), ("编辑", "edit"), ("删除", "delete"), ("菜单查看", "menu:view"), ("用户编辑", "user:edit")]
    for title, mark in marks:
        if not await Permission.filter(auth_mark=mark).exists():
            await Permission.create(title=title, auth_mark=mark)
    for code in ["R_SUPER", "R_ADMIN"]:
        role = await Role.get(code=code)
        for mark in ["add", "edit", "delete", "menu:view", "user:edit"]:
            perm = await Permission.get(auth_mark=mark)
            if not await RolePermission.filter(role=role, permission=perm).exists():
                await RolePermission.create(role=role, permission=perm)
    role = await Role.get(code="R_USER")
    perm = await Permission.get(auth_mark="menu:view")
    if not await RolePermission.filter(role=role, permission=perm).exists():
        await RolePermission.create(role=role, permission=perm)

async def get_user_rbac(username: str):
    await ensure_defaults()
    user = await User.get(username=username)
    uroles = await UserRole.filter(user=user).prefetch_related("role")
    role_codes = [ur.role.code for ur in uroles]
    if not role_codes:
        if username == "admin":
            role = await Role.get(code="R_SUPER")
        elif str(username).startswith("1"):
            role = await Role.get(code="R_SUPER")
        elif str(username).startswith("2"):
            role = await Role.get(code="R_ADMIN")
        else:
            role = await Role.get(code="R_USER")
        await UserRole.create(user=user, role=role)
        role_codes = [role.code]
    # ensure admin always has super role
    if username == "admin" and "R_SUPER" not in role_codes:
        super_role = await Role.get(code="R_SUPER")
        if not await UserRole.filter(user=user, role=super_role).exists():
            await UserRole.create(user=user, role=super_role)
        role_codes.append("R_SUPER")
    perm_ids = await RolePermission.filter(role__code__in=role_codes).values_list("permission_id", flat=True)
    perms = await Permission.filter(id__in=list(perm_ids))
    role_marks = [p.auth_mark for p in perms]
    dep_marks = []
    if user.department:
        dep = await Department.get_or_none(name=user.department)
        if dep:
            dperm_ids = await DepartmentPermission.filter(department=dep).values_list("permission_id", flat=True)
            dperms = await Permission.filter(id__in=list(dperm_ids))
            dep_marks = [p.auth_mark for p in dperms]
    marks = list(set(role_marks) | set(dep_marks))
    return role_codes, marks


# 注册
@user_router.post(
    "/register",
    response_model=TokenResponseModel,
    summary="注册",
)
async def register(item: RegisterModel):
    # 判断两次密码是否一致
    if item.password != item.confirm_password:
        raise HTTPException(status_code=400, detail="两次输入的密码不一致！")
    # 检查用户名是否已存在
    if await User.filter(username=item.username).exists():
        raise HTTPException(status_code=400, detail="用户名已存在！")

    # 对密码进行哈希处理
    hashed_password = auth_utils.get_password_hash(item.password)

    # 进行注册
    user = User(
        username=item.username,
        password=hashed_password,
        nickname=item.nickname,
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
        nickname=user.nickname,
        create_time=user.create_time.isoformat() if user.create_time else None,
        roles=role_codes,
        permissions=marks,
        department=user.department,
        phone=user.phone,
        gender=user.gender,
        avatar=user.avatar,
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
        nickname=user.nickname,
        create_time=user.create_time.isoformat() if user.create_time else None,
        roles=role_codes,
        permissions=marks,
        department=user.department,
        phone=user.phone,
        gender=user.gender,
        avatar=user.avatar,
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
    """获取当前登录用户的信息"""
    role_codes, marks = await get_user_rbac(current_user.username)
    return LoginResponseModel(
        username=current_user.username,
        nickname=current_user.nickname,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        roles=role_codes,
        permissions=marks,
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        avatar=current_user.avatar,
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
    """修改当前用户的密码"""
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
        nickname=current_user.nickname,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        avatar=current_user.avatar,
        status=current_user.status,
    )


# 刷新令牌
@user_router.post(
    "/refresh",
    response_model=TokenResponseModel,
    summary="刷新访问令牌",
)
async def refresh_token(item: RefreshTokenModel):
    """使用刷新令牌获取新的访问令牌"""
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
            nickname=user.nickname,
            create_time=user.create_time.isoformat() if user.create_time else None,
            roles=role_codes,
            permissions=marks,
            department=user.department,
            phone=user.phone,
            gender=user.gender,
            avatar=user.avatar,
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


# 修改昵称
@user_router.post(
    "/update_nickname",
    response_model=LoginResponseModel,
    summary="修改昵称",
)
async def update_nickname(
    item: UpdateNicknameModel, current_user: User = Depends(get_current_active_user)
):
    """修改当前用户的昵称"""
    # 更新昵称
    current_user.nickname = item.nickname
    await current_user.save()

    role_codes, marks = await get_user_rbac(current_user.username)
    return LoginResponseModel(
        username=current_user.username,
        nickname=current_user.nickname,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        roles=role_codes,
        permissions=marks,
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        avatar=current_user.avatar,
        status=current_user.status,
    )

@user_router.post("/update_profile", response_model=LoginResponseModel, summary="更新资料")
async def update_profile(
    phone: Optional[str] = Body(None),
    gender: Optional[str] = Body(None),
    department: Optional[str] = Body(None),
    current_user: User = Depends(get_current_active_user),
):
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
        nickname=current_user.nickname,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
        roles=role_codes,
        permissions=marks,
        department=current_user.department,
        phone=current_user.phone,
        gender=current_user.gender,
        avatar=current_user.avatar,
        status=current_user.status,
    )

 


# 重置密码（通过安全问题）
@user_router.post(
    "/reset_password",
    response_model=LoginResponseModel,
    summary="重置密码",
)
async def reset_password(item: ResetPasswordModel):
    """通过安全问题重置密码"""
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
        nickname=user.nickname,
        create_time=(user.create_time.isoformat() if user.create_time else None),
        roles=role_codes,
        permissions=marks,
        department=user.department,
        phone=user.phone,
        gender=user.gender,
        avatar=user.avatar,
        status=user.status,
    )


# 退出登录
@user_router.post("/logout", summary="退出登录")
async def logout(current_user: User = Depends(get_current_active_user)):
    """退出登录（令牌会在前端删除）"""
    return {"message": "退出登录成功"}
