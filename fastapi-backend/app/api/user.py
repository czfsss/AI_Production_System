from fastapi import APIRouter, Request, HTTPException, Depends, status
from schemas.user import *
from models.models import *
from utils.auth_utils import auth_utils
from utils.dependencies import get_current_active_user
from datetime import datetime


user_router = APIRouter()


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
        username=item.username, password=hashed_password, nickname=item.nickname
    )
    await user.save()

    # 创建JWT令牌
    tokens = auth_utils.create_token_pair(user.username)

    # 返回用户信息和令牌
    user_info = LoginResponseModel(
        username=user.username,
        nickname=user.nickname,
        create_time=user.create_time.isoformat() if user.create_time else None,
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
    user_info = LoginResponseModel(
        username=user.username,
        nickname=user.nickname,
        create_time=user.create_time.isoformat() if user.create_time else None,
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
    return LoginResponseModel(
        username=current_user.username,
        nickname=current_user.nickname,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
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
        user_info = LoginResponseModel(
            username=user.username,
            nickname=user.nickname,
            create_time=user.create_time.isoformat() if user.create_time else None,
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

    return LoginResponseModel(
        username=current_user.username,
        nickname=current_user.nickname,
        create_time=(
            current_user.create_time.isoformat() if current_user.create_time else None
        ),
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

    return LoginResponseModel(
        username=user.username,
        nickname=user.nickname,
        create_time=(user.create_time.isoformat() if user.create_time else None),
    )


# 退出登录
@user_router.post("/logout", summary="退出登录")
async def logout(current_user: User = Depends(get_current_active_user)):
    """退出登录（令牌会在前端删除）"""
    return {"message": "退出登录成功"}
