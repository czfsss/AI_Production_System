from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `department_permission` MODIFY COLUMN `department_id` INT NOT NULL COMMENT '部门';
        ALTER TABLE `department_permission` MODIFY COLUMN `permission_id` INT NOT NULL COMMENT '权限';
        ALTER TABLE `permission` MODIFY COLUMN `title` VARCHAR(50) NOT NULL COMMENT '权限标题';
        ALTER TABLE `permission` MODIFY COLUMN `auth_mark` VARCHAR(50) NOT NULL COMMENT '权限标识';
        ALTER TABLE `role` MODIFY COLUMN `name` VARCHAR(50) NOT NULL COMMENT '角色名称';
        ALTER TABLE `role` MODIFY COLUMN `create_time` DATETIME(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6);
        ALTER TABLE `role` MODIFY COLUMN `enabled` BOOL NOT NULL COMMENT '是否启用' DEFAULT 1;
        ALTER TABLE `role` MODIFY COLUMN `description` VARCHAR(200)  COMMENT '角色描述';
        ALTER TABLE `role` MODIFY COLUMN `code` VARCHAR(50) NOT NULL COMMENT '角色编码';
        ALTER TABLE `role_permission` MODIFY COLUMN `role_id` INT NOT NULL COMMENT '角色';
        ALTER TABLE `role_permission` MODIFY COLUMN `permission_id` INT NOT NULL COMMENT '权限';
        ALTER TABLE `user_role` MODIFY COLUMN `role_id` INT NOT NULL COMMENT '角色';
        ALTER TABLE `user_role` MODIFY COLUMN `user_id` INT NOT NULL COMMENT '用户';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE `role` MODIFY COLUMN `name` VARCHAR(50) NOT NULL;
        ALTER TABLE `role` MODIFY COLUMN `create_time` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
        ALTER TABLE `role` MODIFY COLUMN `enabled` BOOL NOT NULL DEFAULT 1;
        ALTER TABLE `role` MODIFY COLUMN `description` VARCHAR(200);
        ALTER TABLE `role` MODIFY COLUMN `code` VARCHAR(50) NOT NULL;
        ALTER TABLE `user_role` MODIFY COLUMN `role_id` INT NOT NULL;
        ALTER TABLE `user_role` MODIFY COLUMN `user_id` INT NOT NULL;
        ALTER TABLE `permission` MODIFY COLUMN `title` VARCHAR(50) NOT NULL;
        ALTER TABLE `permission` MODIFY COLUMN `auth_mark` VARCHAR(50) NOT NULL;
        ALTER TABLE `role_permission` MODIFY COLUMN `role_id` INT NOT NULL;
        ALTER TABLE `role_permission` MODIFY COLUMN `permission_id` INT NOT NULL;
        ALTER TABLE `department_permission` MODIFY COLUMN `department_id` INT NOT NULL;
        ALTER TABLE `department_permission` MODIFY COLUMN `permission_id` INT NOT NULL;"""
