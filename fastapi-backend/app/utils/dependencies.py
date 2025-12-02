"""
依赖注入 - FastAPI依赖项
使用FastAPI标准的OAuth2PasswordBearer
"""

import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from models.models import User, UserRole, RoleMenu, Department, DepartmentMenu, Menu
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
    # logging.info(f"User: {user}")
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

def require_permissions(*auth_marks):
    """
    权限检查依赖函数
    根据传入的权限标识(auth_mark)列表，校验当前用户是否拥有对应权限
    权限来源：用户所属角色 + 用户所在部门
    """
    async def perm_checker(current_user: User = Depends(get_current_user)):
        # 获取用户所有角色ID和Code
        user_roles_info = await UserRole.filter(user=current_user).values_list("role_id", "role__code")
        role_ids = [info[0] for info in user_roles_info]
        role_codes = [info[1] for info in user_roles_info]

        # 超级管理员(R_SUPER)直接放行
        if "R_SUPER" in role_codes:
            return current_user

        # 根据角色ID查询对应的菜单ID
        role_menu_ids = await RoleMenu.filter(role_id__in=role_ids).values_list("menu_id", flat=True)
        # 查询菜单对应的权限标识
        role_marks = await Menu.filter(id__in=list(role_menu_ids)).exclude(permission__isnull=True).values_list("permission", flat=True)

        # 初始化部门权限标识列表
        dep_marks = []
        # 如果用户有所属部门，则继续查询部门权限
        if current_user.department:
            dep = await Department.get_or_none(name=current_user.department)
            if dep:
                # 获取部门关联的菜单ID
                dep_menu_ids = await DepartmentMenu.filter(department=dep).values_list("menu_id", flat=True)
                # 查询菜单对应的权限标识
                dep_marks = await Menu.filter(id__in=list(dep_menu_ids)).exclude(permission__isnull=True).values_list("permission", flat=True)

        # 合并角色权限与部门权限，去重
        marks = set(role_marks) | set(dep_marks)

        # 校验用户是否拥有所需权限
        for m in auth_marks:
            if m not in marks:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="权限不足")

        # 校验通过，返回当前用户
        return current_user

    return perm_checker
