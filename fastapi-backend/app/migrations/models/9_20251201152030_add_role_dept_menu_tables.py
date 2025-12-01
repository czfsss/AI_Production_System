from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `department_menu` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `department_id` INT NOT NULL COMMENT '部门',
    `menu_id` INT NOT NULL COMMENT '菜单',
    CONSTRAINT `fk_departme_departme_e6135c54` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_departme_menu_b1c15f84` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COMMENT='部门菜单关联表';
        CREATE TABLE IF NOT EXISTS `role_menu` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `menu_id` INT NOT NULL COMMENT '菜单',
    `role_id` INT NOT NULL COMMENT '角色',
    CONSTRAINT `fk_role_men_menu_389ff133` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_role_men_role_dca5a8ec` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COMMENT='角色菜单关联表';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS `role_menu`;
        DROP TABLE IF EXISTS `department_menu`;"""
