from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `form_submission`
            ADD COLUMN `is_draft` BOOL NOT NULL COMMENT '是否草稿' DEFAULT 0;
        ALTER TABLE `form_submission`
            ADD COLUMN `update_time` DATETIME(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6);
        ALTER TABLE `form_submission`
            ADD COLUMN `user_id` INT COMMENT '填报人';
        ALTER TABLE `form_submission`
            ADD CONSTRAINT `fk_form_sub_user_6aff0edb` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `form_submission` DROP FOREIGN KEY `fk_form_sub_user_6aff0edb`;
        ALTER TABLE `form_submission` 
            DROP COLUMN `is_draft`,
            DROP COLUMN `update_time`,
            DROP COLUMN `user_id`;"""
