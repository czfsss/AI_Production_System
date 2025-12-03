from fastapi import APIRouter, HTTPException, Depends, Body
from models.models import Menu, Role, User, UserRole, RoleMenu, Department, DepartmentMenu
from tortoise.expressions import Q
from typing import List, Optional, Any
from utils.dependencies import require_permissions, get_current_active_user
# from core.init_menus import ensure_menu_init
from schemas.menu import MenuSchema, MenuCreate
import logging  
menu_router = APIRouter()

# --- Helper ---

def serialize_menu(menu: Menu, all_menus: List[Menu]):
    children = [m for m in all_menus if m.parent_id == menu.id]
    children.sort(key=lambda x: x.sort)
    
    menu_children = []
    
    for child in children:
        # Only process 'catalogue' and 'menu' types for recursive structure
        if child.type in ['catalogue', 'menu']:
            menu_children.append(serialize_menu(child, all_menus))
            
    res = {
        "id": menu.id,
        "path": menu.path,
        "name": menu.name,
        "component": menu.component,
        "meta": {
            "title": menu.title,
            "icon": menu.icon,
            "keepAlive": menu.keep_alive,
            "isHide": menu.hidden,
            "isHideTab": menu.hide_tab,
            "isIframe": menu.iframe,
            "sort": menu.sort,
            # Convert JSON list to frontend authList format if permission exists
            "authList": [{"title": p, "authMark": p} for p in (menu.permission or [])] if menu.permission else []
        },
        "menuType": menu.type  # Add type to response
    }
    
    if menu_children:
        res["children"] = menu_children
        
    return res

@menu_router.get("/list", summary="获取菜单列表")
async def get_menu_list(current_user: User = Depends(get_current_active_user)):
    """
    获取系统菜单列表（树形结构）。
    根据当前用户的角色和部门权限进行过滤。
    """
    # await ensure_menu_init()
    
    all_menus = await Menu.all()
    logging.info(current_user)
    # 获取用户角色
    user_roles = await UserRole.filter(user=current_user).prefetch_related("role")
    logging.info(f"User roles: {user_roles}")
    role_codes = [ur.role.code for ur in user_roles]
    role_ids = [ur.role.id for ur in user_roles]
    logging.info(f"Role codes: {role_codes}, Role IDs: {role_ids}")
    
    visible_menus = []
    
    # 超级管理员或admin账号拥有所有权限
    if "R_SUPER" in role_codes or current_user.username == "admin":
        visible_menus = all_menus
    else:
        # 1. 获取角色关联的菜单ID
        role_menu_ids = await RoleMenu.filter(role_id__in=role_ids).values_list("menu_id", flat=True)
        
        # 2. 获取部门关联的菜单ID
        dep_menu_ids = []
        if current_user.department:
            # logging.info(f"Department name: {current_user.department}")
            dep = await Department.get_or_none(name=current_user.department)
            logging.info(f"Department: {dep}") 
            if dep:
                dep_menu_ids = await DepartmentMenu.filter(department=dep).values_list("menu_id", flat=True)
        
        # 3. 取并集
        visible_ids = set(role_menu_ids) | set(dep_menu_ids)
        
        # 4. 过滤菜单
        visible_menus = [m for m in all_menus if m.id in visible_ids]

    # 构建树形结构
    top_nodes = [m for m in visible_menus if m.parent_id is None]
    top_nodes.sort(key=lambda x: x.sort)
    
    result = []
    for node in top_nodes:
        # Process top-level nodes
        if node.type in ['catalogue', 'menu']:
            result.append(serialize_menu(node, visible_menus))
            
    return {"menuList": result}

@menu_router.post("/add", summary="新增菜单")
async def add_menu(data: dict = Body(...), current_user: User = Depends(require_permissions("add"))):
    """
    新增菜单。
    """
    
    parent_id = data.get("parentId")
    menu_type = data.get("menuType", "menu")  # Default to 'menu' if not provided
    
    menu = await Menu.create(
        parent_id=parent_id,
        title=data.get("name"), # form.name -> Title
        name=data.get("label"), # form.label -> Route Name
        path=data.get("path"),
        component=data.get("component"),
        icon=data.get("icon"),
        sort=data.get("sort", 1),
        type=menu_type,
        permission=data.get("permission"), # JSON list: ['add', 'edit', 'delete']
        keep_alive=data.get("keepAlive", False),
        hidden=data.get("isHide", False),
        hide_tab=data.get("isHideTab", False),
        iframe=data.get("isIframe", False)
    )
        
    return {"message": "添加成功", "id": menu.id}

@menu_router.post("/update", summary="更新菜单")
async def update_menu(data: dict = Body(...), current_user: User = Depends(require_permissions("edit"))):
    menu_id = data.get("id")
    if not menu_id:
        raise HTTPException(status_code=400, detail="ID不能为空")
        
    menu = await Menu.get_or_none(id=menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="菜单不存在")
        
    if "name" in data: menu.title = data["name"]
    if "label" in data: menu.name = data["label"]
    if "path" in data: menu.path = data["path"]
    if "component" in data: menu.component = data["component"]
    if "icon" in data: menu.icon = data["icon"]
    if "sort" in data: menu.sort = data["sort"]
    if "keepAlive" in data: menu.keep_alive = data["keepAlive"]
    if "isHide" in data: menu.hidden = data["isHide"]
    if "isHideTab" in data: menu.hide_tab = data["isHideTab"]
    if "isIframe" in data: menu.iframe = data["isIframe"]
    if "menuType" in data: menu.type = data["menuType"]
    if "permission" in data: menu.permission = data["permission"]
        
    await menu.save()
    return {"message": "更新成功"}

@menu_router.post("/delete", summary="删除菜单")
async def delete_menu(data: dict = Body(...), current_user: User = Depends(require_permissions("delete"))):
    menu_id = data.get("id")
    if not menu_id:
        raise HTTPException(status_code=400, detail="ID不能为空")
    
    async def delete_recursive(mid):
        children = await Menu.filter(parent_id=mid)
        for child in children:
            await delete_recursive(child.id)
        await Menu.filter(id=mid).delete()
        
    await delete_recursive(menu_id)
    return {"message": "删除成功"}
