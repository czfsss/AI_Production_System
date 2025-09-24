from pydantic import BaseModel, validator, Field
from typing import Optional


# 注册模型
class RegisterModel(BaseModel):
    nickname: str  # 昵称
    username: str = Field(
        min_length=7, max_length=7, description="工号"
    )  # 工号 7位数字的字符串
    password: str  # 密码
    confirm_password: str  # 确认密码

    @validator("username")
    def username_must_be_numeric(cls, v):
        if not v.isdigit():
            raise ValueError("工号必须为7位数字！")

        return v

    @validator("password")
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError("密码必须至少为8位")
        return v

    @validator("confirm_password")
    def confirm_password_must_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("两次输入的密码不一致！")
        return v


# 登录模型
class LoginModel(BaseModel):
    username: str = Field(
        min_length=7, max_length=7, description="工号"
    )  # 工号 7位数字的字符串
    password: str = Field(description="密码")  # 密码


# 修改密码模型
class UpdatePasswordModel(BaseModel):
    old_password: Optional[str] = Field(None, description="旧密码")
    new_password: str = Field(description="新密码")
    confirm_password: str = Field(description="确认新密码")

    @validator("new_password")
    def new_password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError("密码必须至少为8位")
        return v

    @validator("confirm_password")
    def confirm_password_must_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("两次输入的密码不一致！")
        return v


# 查询模型
class QueryModel(BaseModel):
    username: str = Field(description="工号")


# 登录返回用户信息
class LoginResponseModel(BaseModel):
    username: str = Field(description="工号")
    nickname: str = Field(description="昵称")
    create_time: Optional[str] = Field(default=None, description="创建时间")


# JWT令牌响应模型
class TokenResponseModel(BaseModel):
    access_token: str = Field(description="访问令牌")
    refresh_token: str = Field(description="刷新令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    user_info: LoginResponseModel = Field(description="用户信息")


# 刷新令牌请求模型
class RefreshTokenModel(BaseModel):
    refresh_token: str = Field(description="刷新令牌")


# 修改昵称模型
class UpdateNicknameModel(BaseModel):
    nickname: str = Field(min_length=1, max_length=20, description="新昵称")

    @validator("nickname")
    def nickname_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("昵称不能为空")
        return v.strip()


# 重置密码模型（通过安全问题）
class ResetPasswordModel(BaseModel):
    username: str = Field(min_length=7, max_length=7, description="工号")
    security_answer: str = Field(description="安全问题答案")
    new_password: str = Field(description="新密码")
    confirm_password: str = Field(description="确认新密码")

    @validator("username")
    def username_must_be_numeric(cls, v):
        if not v.isdigit():
            raise ValueError("工号必须为7位数字！")
        return v

    @validator("new_password")
    def new_password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError("密码必须至少为8位")
        return v

    @validator("confirm_password")
    def confirm_password_must_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("两次输入的密码不一致！")
        return v

    @validator("security_answer")
    def validate_security_answer(cls, v):
        # 淮阴卷烟厂安全生产管理方针
        correct_answer = "安全第一、预防为主、综合治理"
        if v.strip() != correct_answer:
            raise ValueError("安全问题答案错误！")
        return v.strip()
