from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from settings import TORTOISE_ORM
import uvicorn
from api.user import user_router
from api.fault import fault_router
import os

app = FastAPI(
    title="设备监控系统API",
    description="生产环境API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 生产环境CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:1130",
        "http://127.0.0.1:1130",
        "http://10.43.32.231:1130",  # 生产环境前端地址
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册ORM模型
register_tortoise(app, config=TORTOISE_ORM)

# 注册用户路由
app.include_router(user_router, prefix="/api/user", tags=["用户相关API"])

# 注册故障路由
app.include_router(fault_router, prefix="/api/fault", tags=["故障相关API"])

if __name__ == "__main__":
    # 生产环境配置
    uvicorn.run(
        "main_production:app",
        host="10.43.32.231",  # 绑定到具体IP
        port=8000,
        reload=False,  # 生产环境关闭热重载
        workers=1,  # 可以根据需要调整工作进程数
        access_log=True,
        log_level="info",
    )
