from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS `department_permission`;
        DROP TABLE IF EXISTS `role_permission`;
        DROP TABLE IF EXISTS `permission`;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
