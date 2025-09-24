"""
依赖注入 - FastAPI依赖项
使用FastAPI标准的OAuth2PasswordBearer
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from models.models import User
from utils.auth_utils import auth_utils

# OAuth2PasswordBearer - FastAPI标准OAuth2方案
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/oauth2/token")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """获取当前用户 - FastAPI标准OAuth2依赖注入函数"""

    # 验证token
    payload = auth_utils.verify_token(token)
    username = payload.get("sub")

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 获取用户信息
    user = await User.get_or_none(username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """获取当前活跃用户（可扩展禁用用户功能）"""
    # 这里可以添加用户状态检查逻辑
    # if current_user.is_disabled:
    #     raise HTTPException(status_code=400, detail="用户已被禁用")
    return current_user


# 可选的权限检查依赖
def require_roles(*allowed_roles):
    """角色权限检查装饰器（预留功能）"""

    def role_checker(current_user: User = Depends(get_current_user)):
        # 这里可以添加角色检查逻辑
        # if current_user.role not in allowed_roles:
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="权限不足"
        #     )
        return current_user

    return role_checker
