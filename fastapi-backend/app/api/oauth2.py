"""
OAuth2兼容的认证API
提供标准的OAuth2接口
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from schemas.user import TokenResponseModel, LoginResponseModel
from models.models import User
from utils.auth_utils import auth_utils

oauth2_router = APIRouter()


@oauth2_router.post("/token", response_model=dict, summary="OAuth2令牌获取")
async def oauth2_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2标准的token接口
    兼容OAuth2客户端工具（如Postman、Swagger UI等）
    """
    # 根据用户名获取用户
    user = await User.get_or_none(username=form_data.username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误！",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 验证密码
    if not auth_utils.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误！",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建JWT令牌
    tokens = auth_utils.create_token_pair(user.username)

    # 返回OAuth2标准格式
    return {
        "access_token": tokens["access_token"],
        "token_type": "bearer",
        "expires_in": 1800,  # 30分钟（秒）
        "refresh_token": tokens["refresh_token"],
        "scope": "read write",
    }


@oauth2_router.post("/token/refresh", response_model=dict, summary="刷新OAuth2令牌")
async def oauth2_refresh_token(refresh_token: str):
    """
    OAuth2标准的刷新token接口
    """
    try:
        # 验证刷新令牌
        payload = auth_utils.verify_token(refresh_token)

        # 检查令牌类型
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌",
                headers={"WWW-Authenticate": "Bearer"},
            )

        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 验证用户是否存在
        user = await User.get_or_none(username=username)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户不存在",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 创建新的令牌对
        tokens = auth_utils.create_token_pair(username)

        # 返回OAuth2标准格式
        return {
            "access_token": tokens["access_token"],
            "token_type": "bearer",
            "expires_in": 1800,  # 30分钟（秒）
            "refresh_token": tokens["refresh_token"],
            "scope": "read write",
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )


@oauth2_router.post("/revoke", summary="撤销OAuth2令牌")
async def oauth2_revoke_token(token: str):
    """
    OAuth2标准的撤销token接口
    注意：由于JWT是无状态的，这里只做形式上的撤销
    实际应用中可以配合Redis黑名单实现真正的撤销
    """
    try:
        # 验证令牌格式
        auth_utils.verify_token(token)
        return {"message": "令牌已撤销"}
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="无效的令牌"
        )
