from fastapi import APIRouter, Request, HTTPException
from schemas.user import RegisterModel, LoginModel, LoginResponseModel
from models.models import *

user_router = APIRouter()


# 注册
@user_router.post("/register", response_model=LoginResponseModel, summary="注册")
async def register(item: RegisterModel):
    # 判断两次密码是否一致
    if item.password != item.confirm_password:
        return HTTPException(status_code=400, detail="两次输入的密码不一致！")
    # 检查用户名是否已存在
    if await User.filter(username=item.username).exists():
        return HTTPException(status_code=400, detail="用户名已存在！")
    # 进行注册
    user = User(username=item.username, password=item.password, nickname=item.nickname)
    await user.save()
    return LoginResponseModel(**user.__dict__)


@user_router.post("/login", response_model=LoginResponseModel, summary="登录")
async def login(item: LoginModel):
    # 检查账号密码是否正确
    user = await User.get_or_none(username=item.username, password=item.password)

    if user is None:
        return HTTPException(status_code=400, detail="账号或密码错误！")

    return LoginResponseModel(**user.__dict__)
