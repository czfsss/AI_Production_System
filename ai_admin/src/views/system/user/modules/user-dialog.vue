<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="formData.username" />
      </ElFormItem>
      <ElFormItem label="密码" prop="password" v-if="dialogType === 'add'">
        <ElInput v-model="formData.password" type="password" show-password />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElSelect v-model="formData.gender">
          <ElOption label="男" value="男" />
          <ElOption label="女" value="女" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="角色" prop="role">
        <ElSelect v-model="formData.role" multiple>
          <ElOption
            v-for="role in roleList"
            :key="role.roleId"
            :value="role.roleId"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { fetchGetRoleList, fetchAddUser, fetchUpdateUser } from '@/api/system-manage'

  interface Props {
    visible: boolean
    type: string
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref<Api.SystemManage.RoleListItem[]>([])

  onMounted(async () => {
    const res = await fetchGetRoleList({ current: 1, size: 100 })
    if (res && res.records) {
      roleList.value = res.records
    }
  })

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    username: '',
    password: '',
    phone: '',
    gender: '男',
    role: [] as number[]
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    // Map role names to ids if editing?
    // The backend returns roleNames list. But we need roleIds for editing.
    // This is a problem. UserList API returns roleNames.
    // I should change UserList API to return roleIds as well, or mapping is hard.
    // For now, if we don't have roleIds, we might lose the selection in Edit mode.
    // Let's assume userRoles contains roleIds if I change backend? 
    // Or I fetch user detail.
    // But for now, let's just clear roles or try to map by name if names are unique.
    
    // Wait, userRoles in UserListItem (from backend) is string[] (names).
    // I need IDs.
    // I will update backend to return roleIds in user list or add user detail API.
    // Or I can map names to IDs using roleList.
    
    let currentRoleIds: number[] = []
     if (isEdit && row.userRoles) {
         currentRoleIds = roleList.value
             .filter(r => row.userRoles.includes(r.roleName))
             .map(r => r.roleId)
     }

    Object.assign(formData, {
      username: isEdit ? row.userName || '' : '',
      password: '',
      phone: isEdit ? row.userPhone || '' : '',
      gender: isEdit ? row.userGender || '男' : '男',
      role: currentRoleIds
    })
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        // Ensure role list is loaded
        if (roleList.value.length === 0) {
             fetchGetRoleList({ current: 1, size: 100 }).then(res => {
                 if (res && res.records) roleList.value = res.records
                 initFormData()
             })
        } else {
            initFormData()
        }
        
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
            if (dialogType.value === 'add') {
                await fetchAddUser({
                    username: formData.username,
                    password: formData.password,
                    nickname: formData.username,
                    phone: formData.phone,
                    gender: formData.gender,
                    roleIds: formData.role
                })
                ElMessage.success('添加成功')
            } else {
                await fetchUpdateUser({
                    userId: props.userData.id,
                    username: formData.username,
                    phone: formData.phone,
                    gender: formData.gender,
                    roleIds: formData.role
                })
                ElMessage.success('更新成功')
            }
            dialogVisible.value = false
            emit('submit')
        } catch(e) {
            console.error(e)
        }
      }
    })
  }
</script>
