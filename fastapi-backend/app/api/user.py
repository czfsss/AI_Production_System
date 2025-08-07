from fastapi import APIRouter, Request, HTTPException
from schemas.user import *
from models.models import *

user_router = APIRouter()


# 注册
@user_router.post(
    "/register",
    response_model=LoginResponseModel,
    response_model_exclude={"password"},
    summary="注册",
)
async def register(item: RegisterModel):
    # 判断两次密码是否一致
    if item.password != item.confirm_password:
        raise HTTPException(status_code=400, detail="两次输入的密码不一致！")
    # 检查用户名是否已存在
    if await User.filter(username=item.username).exists():
        raise HTTPException(status_code=400, detail="用户名已存在！")
    # 进行注册
    user = User(username=item.username, password=item.password, nickname=item.nickname)
    await user.save()
    return LoginResponseModel(**user.__dict__)


@user_router.post(
    "/login",
    response_model=LoginResponseModel,
    response_model_exclude={"password"},
    summary="登录",
)
async def login(item: LoginModel):
    # 检查账号密码是否正确
    user = await User.get_or_none(username=item.username, password=item.password)

    if user is None:
        raise HTTPException(status_code=400, detail="账号或密码错误！")

    return LoginResponseModel(**user.__dict__)


@user_router.post(
    "/get_userInfo", response_model=LoginResponseModel, summary="获取用户信息"
)
async def get_user_info(item: QueryModel):
    # 从请求中获取用户信息
    user = await User.get_or_none(username=item.username)
    return LoginResponseModel(**user.__dict__)

# 修改密码
@user_router.post(
    "/update_password",
    response_model=LoginResponseModel,
    response_model_exclude={"password"},
    summary="修改密码",
)
async def update_password(item: UpdatePasswordModel):
    # 从请求中获取用户信息
    user = await User.get_or_none(username=item.username)
    if user is None:
        raise HTTPException(status_code=400, detail="账号不存在，请输入正确的用户名！")

    # 判断两次密码是否一致
    if item.new_password != item.confirm_password:
        raise HTTPException(status_code=400, detail="两次输入的密码不一致！")
    
    # 根据是否有old_password判断是修改密码还是忘记密码
    if item.old_password is not None:
        # 修改密码逻辑：需要验证旧密码
        if user.password != item.old_password:
            raise HTTPException(status_code=400, detail="旧密码错误！")
        # 判断新密码是否与旧密码相同
        if item.new_password == item.old_password:
            raise HTTPException(status_code=400, detail="新密码不能与旧密码相同！")
    else:
        # 忘记密码逻辑：不需要验证旧密码
        # 判断新密码是否与当前密码相同
        if item.new_password == user.password:
            raise HTTPException(status_code=400, detail="新密码不能与当前密码相同！")
    
    # 更新密码
    user.password = item.new_password
    await user.save()
    return LoginResponseModel(**user.__dict__)


