<template>
  <div class="page-content">
    <div class="box-style">
      <div class="header">
        <h2>部门管理</h2>
        <div>
          <ElButton type="primary" v-ripple @click="openAdd">新增部门</ElButton>
        </div>
      </div>
      <ElTable :data="list" :style="{ width: '100%' }" size="small">
        <ElTableColumn prop="id" label="ID" width="80" />
        <ElTableColumn prop="name" label="名称" />
        <ElTableColumn prop="code" label="编码" />
        <ElTableColumn prop="description" label="描述" />
        <ElTableColumn label="启用" width="100">
          <template #default="{ row }">
            <ElSwitch
              :model-value="!!row.enabled"
              @change="(val) => onToggleEnabled(row, Boolean(val))"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="300">
          <template #default="{ row }">
            <ElButton text type="primary" @click="openEdit(row)">编辑</ElButton>
            <ElButton text type="danger" @click="onDelete(row)">删除</ElButton>
            <ElButton text @click="openPermission(row)">菜单权限</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <ElDialog
      v-model="dialog.visible"
      :title="dialog.mode === 'add' ? '新增部门' : '编辑部门'"
      width="480px"
    >
      <ElForm :model="dialog.form" label-width="72px">
        <ElFormItem label="名称" required>
          <ElInput v-model="dialog.form.name" />
        </ElFormItem>
        <ElFormItem label="编码">
          <ElInput v-model="dialog.form.code" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="dialog.form.description" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialog.visible = false">取消</ElButton>
        <ElButton type="primary" @click="onSubmit">保存</ElButton>
      </template>
    </ElDialog>

    <DepartmentPermissionDialog
      v-model="permissionDialog"
      :department-data="currentDepartment"
      @success="load"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchGetDepartmentList,
    fetchAddDepartment,
    fetchUpdateDepartment,
    fetchDeleteDepartment
  } from '@/api/system-manage'
  import DepartmentPermissionDialog from '@views/system/department/modules/department-permission-dialog.vue'

  defineOptions({ name: 'Department' })

  const list = ref<
    Array<{ id: number; name: string; code?: string; description?: string; enabled: boolean }>
  >([])

  const dialog = reactive<{
    visible: boolean
    mode: 'add' | 'edit'
    form: { id?: number; name: string; code?: string; description?: string }
  }>({
    visible: false,
    mode: 'add',
    form: { name: '', code: '', description: '' }
  })

  const load = async () => {
    const resp = await fetchGetDepartmentList()
    list.value = resp.records || []
  }

  onMounted(load)

  const openAdd = () => {
    dialog.mode = 'add'
    dialog.form = { name: '', code: '', description: '' }
    dialog.visible = true
  }

  const openEdit = (row: any) => {
    dialog.mode = 'edit'
    dialog.form = { id: row.id, name: row.name, code: row.code, description: row.description }
    dialog.visible = true
  }

  const onSubmit = async () => {
    try {
      if (!dialog.form.name?.trim()) {
        ElMessage.warning('请输入部门名称')
        return
      }
      const payload: any = { name: dialog.form.name.trim() }
      const code = dialog.form.code?.trim()
      const desc = dialog.form.description?.trim()
      if (code) payload.code = code
      if (desc) payload.description = desc
      if (dialog.mode === 'add') {
        await fetchAddDepartment(payload)
      } else {
        payload.id = dialog.form.id!
        await fetchUpdateDepartment(payload)
      }
      ElMessage.success('保存成功')
      dialog.visible = false
      await load()
    } catch (e: any) {
      ElMessage.error(e?.detail || '操作失败')
    }
  }

  const onDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm(`确定删除部门「${row.name}」?`, '提示', { type: 'warning' })
      await fetchDeleteDepartment({ id: row.id })
      ElMessage.success('删除成功')
      await load()
    } catch {
      void 0
    }
  }

  const onToggleEnabled = async (row: any, val: boolean) => {
    try {
      await fetchUpdateDepartment({ id: row.id, enabled: val })
      ElMessage.success('状态已更新')
    } catch {
      row.enabled = !val
    }
  }

  const permissionDialog = ref(false)
  const currentDepartment = ref<{ id: number; name: string } | undefined>(undefined)

  const openPermission = (row: { id: number; name: string }) => {
    permissionDialog.value = true
    currentDepartment.value = { id: row.id, name: row.name }
  }
</script>

<style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
</style>
