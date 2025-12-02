from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `menu` DROP COLUMN `roles`;
    """


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `menu`
        ADD COLUMN `roles` JSON COMMENT '角色列表';
    """

