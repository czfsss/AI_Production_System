from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from settings import TORTOISE_ORM
import uvicorn
from api.user import user_router
from api.fault import fault_router
from api.equ_monitor import equ_bending_router


app = FastAPI()

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:1130", "http://127.0.0.1:1130"],  # 允许的前端域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有头部
)

# 注册ORM模型
register_tortoise(app=app, config=TORTOISE_ORM)

# 注册用户路由
app.include_router(user_router, prefix="/api/user", tags=["用户相关API"])

# 注册故障路由
app.include_router(fault_router, prefix="/api/fault", tags=["故障相关API"])

# 注册设备监测路由
app.include_router(equ_bending_router, prefix="/api/equ", tags=["设备监测相关API"])
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
