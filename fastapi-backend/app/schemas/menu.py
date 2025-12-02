from pydantic import BaseModel
from typing import List, Optional, Any

class MenuMeta(BaseModel):
    title: str
    icon: Optional[str] = None
    keepAlive: Optional[bool] = None
    isHide: Optional[bool] = None
    isHideTab: Optional[bool] = None
    isIframe: Optional[bool] = None
    fixedTab: Optional[bool] = None
    order: Optional[int] = None
    authList: Optional[List[dict]] = None

class MenuSchema(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None  # Route Name
    path: Optional[str] = None
    component: Optional[str] = None
    redirect: Optional[str] = None
    meta: MenuMeta
    children: Optional[List['MenuSchema']] = []
    # Extra fields for edit
    parentId: Optional[int] = None
    type: str = "menu" # menu, button
    permission: Optional[str] = None

class MenuCreate(BaseModel):
    name: str  # Title or Auth Name
    path: Optional[str] = ""
    label: Optional[str] = "" # Route Name or Auth Mark
    component: Optional[str] = ""
    icon: Optional[str] = ""
    sort: int = 1
    isMenu: bool = True
    keepAlive: bool = False
    isHide: bool = False
    isHideTab: bool = False
    isIframe: bool = False
    fixedTab: bool = False
    
    # Button specific
    authName: Optional[str] = None
    authLabel: Optional[str] = None
    authIcon: Optional[str] = None
    authSort: int = 1
    
    parentId: Optional[int] = None
    type: str = "menu" # menu, button
