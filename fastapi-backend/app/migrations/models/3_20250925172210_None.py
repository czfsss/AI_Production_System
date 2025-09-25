from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS `fault_info` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    `mch_name` VARCHAR(20) NOT NULL  COMMENT '设备名称',
    `fault_time` DATETIME(6) NOT NULL  COMMENT '故障发生时间',
    `stop_time` VARCHAR(20) NOT NULL  COMMENT '停止时长',
    `fault_name` VARCHAR(20) NOT NULL  COMMENT '故障名称',
    `mch_params` JSON NOT NULL  COMMENT '设备参数',
    `ai_analysis` LONGTEXT NOT NULL  COMMENT 'AI分析结果',
    `class_group` VARCHAR(20) NOT NULL  COMMENT '班组',
    `class_shift` VARCHAR(20) NOT NULL  COMMENT '班次'
) CHARACTER SET utf8mb4 COMMENT='历史故障信息表';
CREATE TABLE IF NOT EXISTS `fault_point_map` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    `mchCode` VARCHAR(20) NOT NULL  COMMENT '设备编码',
    `faultId` VARCHAR(20) NOT NULL  COMMENT '故障ID',
    `faultName` VARCHAR(20) NOT NULL  COMMENT '故障名称'
) CHARACTER SET utf8mb4 COMMENT='故障点位映射表';
CREATE TABLE IF NOT EXISTS `mach_point_map` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    `mach_name` VARCHAR(20) NOT NULL  COMMENT '机器名称',
    `mach_no` VARCHAR(20) NOT NULL  COMMENT '设备编码',
    `eqptype_name` VARCHAR(20) NOT NULL  COMMENT '设备类型名称',
    `point` INT NOT NULL  COMMENT '点位号',
    `point_name` VARCHAR(20) NOT NULL  COMMENT '点位名称'
) CHARACTER SET utf8mb4 COMMENT='设备点位映射表';
CREATE TABLE IF NOT EXISTS `user` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT COMMENT '自增ID',
    `username` VARCHAR(20) NOT NULL UNIQUE COMMENT '用户名',
    `password` VARCHAR(100) NOT NULL  COMMENT '密码',
    `nickname` VARCHAR(20) NOT NULL  COMMENT '昵称',
    `create_time` DATETIME(6) NOT NULL  COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)
) CHARACTER SET utf8mb4 COMMENT='用户信息表';
CREATE TABLE IF NOT EXISTS `aerich` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `version` VARCHAR(255) NOT NULL,
    `app` VARCHAR(100) NOT NULL,
    `content` JSON NOT NULL
) CHARACTER SET utf8mb4;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
