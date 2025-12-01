from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `form` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    `name` VARCHAR(100) NOT NULL COMMENT '表单名称',
    `description` VARCHAR(255)   COMMENT '表单描述',
    `schema` JSON NOT NULL COMMENT '表单结构JSON',
    `create_time` DATETIME(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `update_time` DATETIME(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `creator_id` INT COMMENT '创建者',
    CONSTRAINT `fk_form_user_0b080971` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COMMENT='表单信息表';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS `form`;"""
