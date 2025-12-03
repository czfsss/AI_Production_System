from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `menu` MODIFY COLUMN `type` VARCHAR(20) NOT NULL COMMENT '类型: catalogue(目录), menu(菜单)' DEFAULT 'menu';
        ALTER TABLE `menu` MODIFY COLUMN `permission` JSON COMMENT '操作权限: ["add", "edit", "delete"]';
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `menu` MODIFY COLUMN `type` VARCHAR(10) NOT NULL COMMENT '类型: menu, button' DEFAULT 'menu';
        ALTER TABLE `menu` MODIFY COLUMN `permission` VARCHAR(100) COMMENT '权限标识';
    """
