from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `department` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '部门名称',
    `code` VARCHAR(50) UNIQUE COMMENT '部门编码',
    `description` VARCHAR(200)   COMMENT '部门描述',
    `enabled` BOOL NOT NULL COMMENT '启用状态' DEFAULT 1,
    `create_time` DATETIME(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)
) CHARACTER SET utf8mb4;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS `department`;"""
