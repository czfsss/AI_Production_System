from pydantic import BaseModel, validator, Field
from typing import Optional, List


# 注册模型
class RegisterModel(BaseModel):
    real_name: str = Field(description="姓名")  # 姓名
    username: str = Field(
        min_length=2, max_length=50, description="用户名"
    )
    password: str  # 密码
    confirm_password: str  # 确认密码
    department: str = Field(min_length=1, max_length=50, description="部门")

    @validator("password")
    def password_must_be_strong(cls, v):
        if len(v) < 6:
            raise ValueError("密码必须至少为6位")
        return v

    @validator("confirm_password")
    def confirm_password_must_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("两次输入的密码不一致！")
        return v

    @validator("department")
    def department_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("部门不能为空")
        return v.strip()


# 登录模型
class LoginModel(BaseModel):
    username: str = Field(
        min_length=2, max_length=50, description="用户名"
    )
    password: str = Field(description="密码")  # 密码


# 修改密码模型
class UpdatePasswordModel(BaseModel):
    old_password: Optional[str] = Field(None, description="旧密码")
    new_password: str = Field(description="新密码")
    confirm_password: str = Field(description="确认新密码")

    @validator("new_password")
    def new_password_must_be_strong(cls, v):
        if len(v) < 6:
            raise ValueError("密码必须至少为6位")
        return v

    @validator("confirm_password")
    def confirm_password_must_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("两次输入的密码不一致！")
        return v


# 查询模型
class QueryModel(BaseModel):
    username: str = Field(description="用户名")


# 登录返回用户信息
class LoginResponseModel(BaseModel):
    username: str = Field(description="用户名")
    real_name: str = Field(description="姓名")
    create_time: Optional[str] = Field(default=None, description="创建时间")
    roles: Optional[List[str]] = Field(default=None, description="角色列表")
    permissions: Optional[List[str]] = Field(default=None, description="权限标识列表")
    department: Optional[str] = Field(default=None, description="部门")
    phone: Optional[str] = Field(default=None, description="手机号")
    gender: Optional[str] = Field(default=None, description="性别")
    status: Optional[int] = Field(default=None, description="状态")


# JWT令牌响应模型
class TokenResponseModel(BaseModel):
    access_token: str = Field(description="访问令牌")
    refresh_token: str = Field(description="刷新令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
    user_info: LoginResponseModel = Field(description="用户信息")


# 刷新令牌请求模型
class RefreshTokenModel(BaseModel):
    refresh_token: str = Field(description="刷新令牌")


# 修改姓名模型
class UpdateRealNameModel(BaseModel):
    real_name: str = Field(min_length=1, max_length=20, description="新姓名")

    @validator("real_name")
    def real_name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("姓名不能为空")
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
