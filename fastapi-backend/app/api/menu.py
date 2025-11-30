from fastapi import APIRouter

menu_router = APIRouter()

@menu_router.get("/list")
async def get_menu_list():
    menu_list = [
        {
            "name": "Dashboard",
            "path": "/dashboard",
            "component": "/index/index",
            "redirect": "/dashboard/console",
            "meta": {
                "title": "menus.dashboard.title",
                "icon": "&#xe721;",
                "roles": ["R_SUPER", "R_ADMIN", "R_USER"],
            },
            "children": [
                {
                    "path": "console",
                    "name": "Console",
                    "component": "/dashboard/console",
                    "meta": {
                        "title": "menus.dashboard.console",
                        "keepAlive": False,
                        "fixedTab": True,
                        "roles": ["R_SUPER", "R_ADMIN", "R_USER"],
                    },
                }
            ],
        },
        {
            "path": "/system",
            "name": "System",
            "component": "/index/index",
            "redirect": "/system/user",
            "meta": {
                "title": "menus.system.title",
                "icon": "&#xe7b9;",
                "roles": ["R_SUPER", "R_ADMIN"],
            },
            "children": [
                {
                    "path": "user",
                    "name": "User",
                    "component": "/system/user",
                    "meta": {
                        "title": "menus.system.user",
                        "keepAlive": True,
                        "roles": ["R_SUPER", "R_ADMIN"],
                    },
                },
                {
                    "path": "user-center",
                    "name": "UserCenter",
                    "component": "/system/user-center",
                    "meta": {
                        "title": "menus.system.userCenter",
                        "keepAlive": True,
                        "roles": ["R_SUPER", "R_ADMIN", "R_USER"],
                        "isHide": True,
                        "isHideTab": True,
                    },
                },
                {
                    "path": "role",
                    "name": "Role",
                    "component": "/system/role",
                    "meta": {
                        "title": "menus.system.role",
                        "keepAlive": True,
                        "roles": ["R_SUPER"],
                    },
                },
                {
                    "path": "menu",
                    "name": "Menus",
                    "component": "/system/menu",
                    "meta": {
                        "title": "menus.system.menu",
                        "keepAlive": True,
                        "roles": ["R_SUPER"],
                        "authList": [
                            {"title": "新增", "authMark": "add"},
                            {"title": "编辑", "authMark": "edit"},
                            {"title": "删除", "authMark": "delete"},
                        ],
                    },
                },
                {
                    "path": "department",
                    "name": "Department",
                    "component": "/system/department",
                    "meta": {
                        "title": "部门管理",
                        "keepAlive": True,
                        "roles": ["R_SUPER", "R_ADMIN"],
                    },
                },
            ],
        },
    ]
    return {"menuList": menu_list}
