from pydantic import BaseModel, validator, Field


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


# 登录返回用户信息
class LoginResponseModel(BaseModel):
    username: str = Field(description="工号")
    nickname: str = Field(description="昵称")
