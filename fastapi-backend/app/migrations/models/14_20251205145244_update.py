from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `role_menu` ADD `permission` JSON  COMMENT '角色在该菜单的按钮权限列表';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `role_menu` DROP COLUMN `permission`;"""
