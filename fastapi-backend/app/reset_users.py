import asyncio
from tortoise import Tortoise
from models.models import User, Role, UserRole
from utils.auth_utils import auth_utils
from settings import TORTOISE_ORM

async def reset_users():
    print("Connecting to database...")
    await Tortoise.init(config=TORTOISE_ORM)
    
    print("Clearing existing users and associations...")
    # Clear UserRole first to avoid foreign key constraints (though usually cascade, but safe)
    await UserRole.all().delete()
    await User.all().delete()
    print("Users cleared.")

    print("Creating super admin...")
    # Ensure R_SUPER role exists
    super_role = await Role.get_or_none(code="R_SUPER")
    if not super_role:
        print("Creating R_SUPER role...")
        super_role = await Role.create(
            name="超级管理员",
            code="R_SUPER",
            description="系统最高权限管理者",
            enabled=True
        )
    
    # Create admin user
    hashed_password = auth_utils.get_password_hash("123456")
    admin_user = await User.create(
        username="admin",
        password=hashed_password,
        nickname="超级管理员",
        phone="13800000000",
        gender="男",
        status=1,
        avatar="https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif"
    )
    
    # Assign role
    await UserRole.create(user=admin_user, role=super_role)
    
    print("Super admin created successfully.")
    print("Username: admin")
    print("Password: 123456")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(reset_users())
