import asyncio
from tortoise import fields
from tortoise.models import Model


class User(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    username = fields.CharField(max_length=20, unique=True, description="用户名")
    password = fields.CharField(max_length=100, description="密码")
    nickname = fields.CharField(max_length=20, description="昵称")
    create_time = fields.DatetimeField(auto_now_add=True, description="创建时间")

    def __str__(self):  # 定义对象的字符串表示，方便打印和调试

        return self.username

    class Meta:  # 元类，在创建表时指定表名和表描述
        table = "user"
        table_description = "用户信息表"


class FaultInfo(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    mch_name = fields.CharField(max_length=20, description="设备名称")
    fault_time = fields.DatetimeField(description="故障发生时间")
    stop_time = fields.CharField(max_length=20, description="停止时长")
    fault_name = fields.CharField(max_length=20, description="故障名称")
    mch_params = fields.JSONField(description="设备参数")
    ai_analysis = fields.TextField(description="AI分析结果")
    class_group = fields.CharField(max_length=20, description="班组")
    class_shift = fields.CharField(max_length=20, description="班次")

    def __str__(self):
        return self.mch_name

    class Meta:
        table = "fault_info"
        table_description = "历史故障信息表"


class FaultPointMap(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    mchCode = fields.CharField(max_length=20, description="设备编码")
    faultId = fields.CharField(max_length=20, description="故障ID")
    faultName = fields.CharField(max_length=20, description="故障名称")

    class Meta:
        table = "fault_point_map"
        table_description = "故障点位映射表"

    def __str__(self):
        return self.mchCode


class MachPointMap(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    mach_name = fields.CharField(max_length=20, description="机器名称")
    mach_no = fields.CharField(max_length=20, description="设备编码")
    eqptype_name = fields.CharField(max_length=20, description="设备类型名称")
    point = fields.IntField(description="点位号")
    point_name = fields.CharField(max_length=20, description="点位名称")

    class Meta:
        table = "mach_point_map"
        table_description = "设备点位映射表"

    def __str__(self):
        return self.mach_name


