from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `fault_point_map` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    `mchCode` VARCHAR(20) NOT NULL COMMENT '设备编码',
    `faultId` VARCHAR(20) NOT NULL COMMENT '故障ID',
    `faultName` VARCHAR(20) NOT NULL COMMENT '故障名称'
) CHARACTER SET utf8mb4 COMMENT='故障点位映射表';
        CREATE TABLE IF NOT EXISTS `mach_point_map` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    `mach_name` VARCHAR(20) NOT NULL COMMENT '机器名称',
    `mach_no` VARCHAR(20) NOT NULL COMMENT '设备编码',
    `eqptype_name` VARCHAR(20) NOT NULL COMMENT '设备类型名称',
    `point` INT NOT NULL COMMENT '点位号',
    `point_name` VARCHAR(20) NOT NULL COMMENT '点位名称'
) CHARACTER SET utf8mb4 COMMENT='设备点位映射表';"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS `mach_point_map`;
        DROP TABLE IF EXISTS `fault_point_map`;"""
