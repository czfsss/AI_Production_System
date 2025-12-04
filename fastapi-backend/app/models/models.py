import asyncio
import uuid
from tortoise import fields
from tortoise.models import Model


class User(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    username = fields.CharField(max_length=20, unique=True, description="用户名")
    password = fields.CharField(max_length=100, description="密码")
    real_name = fields.CharField(max_length=20, description="姓名")
    department = fields.CharField(max_length=50, null=True, description="部门")
    phone = fields.CharField(max_length=20, null=True, description="手机号")
    gender = fields.CharField(max_length=10, null=True, description="性别")
    status = fields.IntField(default=1, description="状态: 1正常 2禁用")
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


class Role(Model):
    id = fields.IntField(pk=True, auto=True, description="角色ID")
    name = fields.CharField(max_length=50, unique=True, description="角色名称")
    code = fields.CharField(max_length=50, unique=True, description="角色编码")
    description = fields.CharField(max_length=200, null=True, description="角色描述")
    enabled = fields.BooleanField(default=True, description="是否启用")
    create_time = fields.DatetimeField(auto_now_add=True, description="创建时间")

    class Meta:
        table = "role"
        table_description = "角色表"


class UserRole(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    user = fields.ForeignKeyField("models.User", related_name="user_roles", description="用户")
    role = fields.ForeignKeyField("models.Role", related_name="role_users", description="角色")

    class Meta:
        table = "user_role"
        table_description = "用户角色关联表"


class RoleMenu(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    role = fields.ForeignKeyField("models.Role", related_name="role_menus", description="角色")
    menu = fields.ForeignKeyField("models.Menu", related_name="menu_roles", description="菜单")

    class Meta:
        table = "role_menu"
        table_description = "角色菜单关联表"


class Department(Model):
    id = fields.IntField(pk=True, auto=True, description="部门ID")
    name = fields.CharField(max_length=50, unique=True, description="部门名称")
    code = fields.CharField(max_length=50, unique=True, null=True, description="部门编码")
    description = fields.CharField(max_length=200, null=True, description="部门描述")
    enabled = fields.BooleanField(default=True, description="启用状态")
    create_time = fields.DatetimeField(auto_now_add=True, description="创建时间")

    class Meta:
        table = "department"
        table_description = "部门表"


class DepartmentMenu(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    department = fields.ForeignKeyField("models.Department", related_name="department_menus", description="部门")
    menu = fields.ForeignKeyField("models.Menu", related_name="menu_departments", description="菜单")

    class Meta:
        table = "department_menu"
        table_description = "部门菜单关联表"


class Menu(Model):
    id = fields.IntField(pk=True, auto=True, description="菜单ID")
    parent = fields.ForeignKeyField("models.Menu", related_name="children", null=True, description="父菜单")
    title = fields.CharField(max_length=50, description="菜单名称")
    name = fields.CharField(max_length=50, null=True, description="路由名称")
    path = fields.CharField(max_length=200, null=True, description="路由路径")
    component = fields.CharField(max_length=200, null=True, description="组件路径")
    icon = fields.CharField(max_length=50, null=True, description="图标")
    sort = fields.IntField(default=1, description="排序")
    type = fields.CharField(max_length=20, default="menu", description="类型: catalogue(目录), menu(菜单)")
    permission = fields.JSONField(null=True, description="操作权限: ['add', 'edit', 'delete']")
    
    keep_alive = fields.BooleanField(default=False, description="是否缓存")
    hidden = fields.BooleanField(default=False, description="是否隐藏")
    hide_tab = fields.BooleanField(default=False, description="是否隐藏标签")
    iframe = fields.BooleanField(default=False, description="是否内嵌")
    
    create_time = fields.DatetimeField(auto_now_add=True, description="创建时间")

    class Meta:
        table = "menu"
        table_description = "菜单表"


class Form(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    uuid = fields.UUIDField(default=uuid.uuid4, unique=True, description="表单唯一标识")
    name = fields.CharField(max_length=100, description="表单名称")
    description = fields.CharField(max_length=255, null=True, description="表单描述")
    schema = fields.JSONField(description="表单结构JSON")
    creator = fields.ForeignKeyField("models.User", related_name="forms", description="创建者", null=True)
    create_time = fields.DatetimeField(auto_now_add=True, description="创建时间")
    update_time = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "form"
        table_description = "表单信息表"


class FormSubmission(Model):
    id = fields.IntField(pk=True, auto=True, description="自增ID")
    form = fields.ForeignKeyField("models.Form", related_name="submissions", description="所属表单")
    data = fields.JSONField(description="填报数据")
    user = fields.ForeignKeyField("models.User", related_name="form_submissions", null=True, description="填报人")
    is_draft = fields.BooleanField(default=False, description="是否草稿")
    create_time = fields.DatetimeField(auto_now_add=True, description="提交时间")
    update_time = fields.DatetimeField(auto_now=True, description="更新时间")

    class Meta:
        table = "form_submission"
        table_description = "表单填报记录表"


