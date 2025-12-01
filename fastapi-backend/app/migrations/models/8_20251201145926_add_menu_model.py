from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `menu` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '菜单ID',
    `title` VARCHAR(50) NOT NULL COMMENT '菜单名称',
    `name` VARCHAR(50)   COMMENT '路由名称',
    `path` VARCHAR(200)   COMMENT '路由路径',
    `component` VARCHAR(200)   COMMENT '组件路径',
    `icon` VARCHAR(50)   COMMENT '图标',
    `sort` INT NOT NULL COMMENT '排序' DEFAULT 1,
    `type` VARCHAR(10) NOT NULL COMMENT '类型: menu, button' DEFAULT 'menu',
    `permission` VARCHAR(100)   COMMENT '权限标识',
    `roles` JSON   COMMENT '角色列表',
    `keep_alive` BOOL NOT NULL COMMENT '是否缓存' DEFAULT 0,
    `hidden` BOOL NOT NULL COMMENT '是否隐藏' DEFAULT 0,
    `hide_tab` BOOL NOT NULL COMMENT '是否隐藏标签' DEFAULT 0,
    `iframe` BOOL NOT NULL COMMENT '是否内嵌' DEFAULT 0,
    `create_time` DATETIME(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6),
    `parent_id` INT COMMENT '父菜单',
    CONSTRAINT `fk_menu_menu_a0892170` FOREIGN KEY (`parent_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COMMENT='菜单表';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS `menu`;"""
