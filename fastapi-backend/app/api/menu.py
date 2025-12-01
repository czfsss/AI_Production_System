from fastapi import APIRouter, HTTPException, Depends, Body
from models.models import Menu, Role, User
from tortoise.expressions import Q
from typing import List, Optional, Any
from utils.dependencies import require_permissions
# from core.init_menus import ensure_menu_init
from schemas.menu import MenuSchema, MenuCreate

menu_router = APIRouter()

# --- Helper ---

def serialize_menu(menu: Menu, all_menus: List[Menu]):
    children = [m for m in all_menus if m.parent_id == menu.id]
    children.sort(key=lambda x: x.sort)
    
    menu_children = []
    auth_list = []
    
    for child in children:
        if child.type == 'button':
            auth_list.append({
                "title": child.title,
                "authMark": child.permission,
                "id": child.id,
                "sort": child.sort
            })
        else:
            menu_children.append(serialize_menu(child, all_menus))
            
    res = {
        "id": menu.id,
        "path": menu.path,
        "name": menu.name,
        "component": menu.component,
        "meta": {
            "title": menu.title,
            "icon": menu.icon,
            "roles": menu.roles or [],
            "keepAlive": menu.keep_alive,
            "isHide": menu.hidden,
            "isHideTab": menu.hide_tab,
            "isIframe": menu.iframe,
            "sort": menu.sort,
        }
    }
    
    if auth_list:
        res["meta"]["authList"] = auth_list
        
    if menu_children:
        res["children"] = menu_children
        
    return res

@menu_router.get("/list", summary="获取菜单列表")
async def get_menu_list():
    """
    获取系统菜单列表（树形结构）。
    """
    # await ensure_menu_init()
    
    all_menus = await Menu.all()
    top_nodes = [m for m in all_menus if m.parent_id is None]
    top_nodes.sort(key=lambda x: x.sort)
    
    result = []
    for node in top_nodes:
        # Top level nodes in the hardcoded list usually don't have type='button'
        if node.type == 'menu':
            result.append(serialize_menu(node, all_menus))
            
    return {"menuList": result}

@menu_router.post("/add", summary="新增菜单")
async def add_menu(data: dict = Body(...), current_user: User = Depends(require_permissions("user:edit"))):
    """
    新增菜单或权限按钮。
    """
    
    parent_id = data.get("parentId")
    
    if data.get("authName"): # It is a button
        title = data.get("authName")
        permission = data.get("authLabel")
        sort = data.get("authSort", 1)
        
        menu = await Menu.create(
            parent_id=parent_id,
            title=title,
            permission=permission,
            type="button",
            sort=sort,
            roles=data.get("roles")
        )
            
    else: # It is a menu
        menu = await Menu.create(
            parent_id=parent_id,
            title=data.get("name"), # form.name -> Title
            name=data.get("label"), # form.label -> Route Name
            path=data.get("path"),
            component=data.get("component"),
            icon=data.get("icon"),
            sort=data.get("sort", 1),
            type="menu",
            roles=data.get("roles"),
            keep_alive=data.get("keepAlive", False),
            hidden=data.get("isHide", False),
            hide_tab=data.get("isHideTab", False),
            iframe=data.get("isIframe", False)
        )
        
    return {"message": "添加成功", "id": menu.id}

@menu_router.post("/update", summary="更新菜单")
async def update_menu(data: dict = Body(...), current_user: User = Depends(require_permissions("user:edit"))):
    menu_id = data.get("id")
    if not menu_id:
        raise HTTPException(status_code=400, detail="ID不能为空")
        
    menu = await Menu.get_or_none(id=menu_id)
    if not menu:
        raise HTTPException(status_code=404, detail="菜单不存在")
        
    if data.get("authName"): # Update button
        menu.title = data.get("authName")
        menu.permission = data.get("authLabel")
        menu.sort = data.get("authSort", menu.sort)
    else:
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
        if "roles" in data: menu.roles = data["roles"]
        
    await menu.save()
    return {"message": "更新成功"}

@menu_router.post("/delete", summary="删除菜单")
async def delete_menu(data: dict = Body(...), current_user: User = Depends(require_permissions("user:edit"))):
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
