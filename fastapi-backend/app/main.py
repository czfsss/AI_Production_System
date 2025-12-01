from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from settings import TORTOISE_ORM
import uvicorn
from api.user import user_router
from api.fault import fault_router
from api.equ_monitor_ws import websocket_router
from api.echarts import echarts_router
from api.oauth2 import oauth2_router
from api.menu import menu_router
from api.rbac import rbac_router
from api.department import department_router
from api.form import form_router
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
import os


app = FastAPI(
    title="AI生产系统API",
    description="具备JWT认证和OAuth2支持的生产监控系统",
    version="1.0.0",
)


# 静态文件
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# 重定向docs
@app.get("/", summary="重定向到docs")
async def redirect_to_docs():
    return RedirectResponse(url="/docs")

@app.get("/api/health", summary="健康检查")
async def health():
    return {"status": "ok"}


# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1133", "http://127.0.0.1:1133", "http://localhost:3006", "http://127.0.0.1:3006"],  # 允许的前端域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有头部
)

# 注册ORM模型
register_tortoise(app=app, config=TORTOISE_ORM, generate_schemas=True)

# 注册用户路由
app.include_router(user_router, prefix="/api/user", tags=["用户相关API"])

# 注册故障路由
app.include_router(fault_router, prefix="/api/fault", tags=["故障相关API"])

# 注册Echarts路由
app.include_router(echarts_router, prefix="/api", tags=["Echarts相关API"])

# 注册WebSocket路由
app.include_router(websocket_router, prefix="/api", tags=["WebSocket相关API"])

# 注册OAuth2路由
app.include_router(oauth2_router, prefix="/oauth2", tags=["OAuth2认证API"])

# 注册菜单路由
app.include_router(menu_router, prefix="/api/menu", tags=["菜单相关API"])
app.include_router(rbac_router, prefix="/api", tags=["RBAC相关API"])
app.include_router(department_router, prefix="/api/department", tags=["部门管理API"])
app.include_router(form_router, prefix="/api/form", tags=["表单相关API"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
