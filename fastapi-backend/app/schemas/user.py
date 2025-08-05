from pydantic import BaseModel, constr, validator

class User(BaseModel):
    username: constr(regex=r'^\d{7}$')  # 7位数字的字符串
    password: str  # 密码
    nickname: str  # 昵称
    
    @validator('username')
    def username_must_be_numeric(cls, v):
        if not v.isdigit():
            raise ValueError('工号必须为7位数字！')

        return v
    
    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('密码必须至少为8位')
        return v