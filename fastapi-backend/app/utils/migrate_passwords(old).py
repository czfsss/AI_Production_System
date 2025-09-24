"""
密码迁移脚本 - 将现有用户的明文密码转换为哈希密码
运行此脚本前请确保备份数据库！
"""

import asyncio
import sys
import os

# 添加app目录到Python路径，确保能找到模块
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, app_dir)

from tortoise import Tortoise
from models.models import User
from auth_utils import auth_utils
from settings import TORTOISE_ORM


async def migrate_passwords():
    """迁移现有用户的密码为哈希格式"""
    # 初始化数据库连接
    await Tortoise.init(config=TORTOISE_ORM)

    try:
        # 获取所有用户
        users = await User.all()

        if not users:
            print("没有找到用户数据")
            return

        print(f"找到 {len(users)} 个用户，开始迁移密码...")

        migrated_count = 0
        for user in users:
            # 检查密码是否已经是哈希格式
            # bcrypt哈希通常以$2b$开头，长度约60字符
            if user.password.startswith("$2b$") and len(user.password) == 60:
                print(f"用户 {user.username} 的密码已经是哈希格式，跳过")
                continue

            # 备份原密码（仅用于日志）
            original_password = user.password

            # 生成哈希密码
            hashed_password = auth_utils.get_password_hash(original_password)

            # 更新密码
            user.password = hashed_password
            await user.save()

            migrated_count += 1
            print(f"已迁移用户: {user.username}")

        print(f"\n迁移完成！共迁移了 {migrated_count} 个用户的密码")

    except Exception as e:
        print(f"迁移过程中出错: {str(e)}")

    finally:
        # 关闭数据库连接
        await Tortoise.close_connections()


async def verify_migration():
    """验证迁移结果"""
    await Tortoise.init(config=TORTOISE_ORM)

    try:
        users = await User.all()
        print(f"\n=== 迁移验证 ===")

        for user in users:
            # 检查密码格式
            is_hashed = user.password.startswith("$2b$") and len(user.password) == 60
            print(
                f"用户 {user.username}: 密码格式 {'✓ 已哈希' if is_hashed else '✗ 未哈希'}"
            )

    except Exception as e:
        print(f"验证过程中出错: {str(e)}")

    finally:
        await Tortoise.close_connections()


if __name__ == "__main__":
    print("=== 密码迁移工具 ===")
    print("警告：此操作将修改数据库中的用户密码，请确保已备份数据库！")

    choice = input("是否继续？(y/N): ").lower()
    if choice != "y":
        print("操作已取消")
        exit()

    # 执行迁移
    asyncio.run(migrate_passwords())

    # 验证迁移结果
    asyncio.run(verify_migration())
