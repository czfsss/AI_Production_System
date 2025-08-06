from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from settings import TORTOISE_ORM
import uvicorn
from api.user import user_router

app = FastAPI()

# 注册ORM模型
register_tortoise( app,config=TORTOISE_ORM)

# 注册用户路由
app.include_router(user_router,prefix='/api/user',tags=['用户相关API'])




if __name__ == '__main__':
    uvicorn.run("main:app", host='127.0.0.1', port=8000,reload=True)

