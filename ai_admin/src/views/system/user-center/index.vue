<template>
  <div class="page-content user">
    <div class="content">
      <div class="right-wrap two-col">
        <div class="info box-style">
          <h1 class="title">基本设置</h1>

          <ElForm
            :model="form"
            class="form"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="姓名" prop="realName">
                <ElInput v-model="form.realName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="性别" prop="sex" class="right-input">
                <ElSelect v-model="form.sex" placeholder="Select" :disabled="!isEdit">
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="手机" prop="mobile">
                <ElInput v-model="form.mobile" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="部门" prop="department">
                <ElSelect v-model="form.department" placeholder="请选择部门" :disabled="!isEdit">
                  <ElOption label="生产制造处" value="生产制造处" />
                </ElSelect>
              </ElFormItem>
            </ElRow>
            <div class="el-form-item-right">
              <ElButton type="primary" style="width: 90px" v-ripple @click="edit">
                {{ isEdit ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="info box-style">
          <h1 class="title">更改密码</h1>

          <ElForm :model="pwdForm" class="form" label-width="86px" label-position="top">
            <ElFormItem label="当前密码" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="el-form-item-right">
              <ElButton type="primary" style="width: 90px" v-ripple @click="editPwd">
                {{ isEditPwd ? '保存' : '编辑' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { ElForm, FormInstance, FormRules, ElMessage } from 'element-plus'
  import {
    fetchGetUserInfo,
    fetchUpdateRealName,
    fetchUpdatePassword,
    fetchUpdateProfile
  } from '@/api/auth'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const form = reactive({
    realName: '',
    mobile: '',
    sex: '2',
    department: ''
  })

  const pwdForm = reactive({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })

  const ruleFormRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    realName: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    sex: [{ type: 'array', required: true, message: '请选择性别', trigger: 'blur' }],
    department: [{ required: false, message: '请选择部门', trigger: 'blur' }]
  })

  const options = [
    {
      value: '1',
      label: '男'
    },
    {
      value: '2',
      label: '女'
    }
  ]

  onMounted(async () => {
    try {
      const data = await fetchGetUserInfo()
      userStore.setUserInfo(data)
      form.realName = data.real_name || ''
      form.mobile = data.phone || ''
      form.sex = data.gender === '男' ? '1' : '2'
      form.department = data.department || ''
    } catch {
      void 0
    }
  })

  const edit = async () => {
    if (!isEdit.value) {
      isEdit.value = true
      return
    }
    try {
      await fetchUpdateRealName({ real_name: form.realName })
      const resProfile = await fetchUpdateProfile({
        phone: form.mobile,
        gender: form.sex === '1' ? '男' : '女',
        department: form.department || undefined
      })
      userStore.setUserInfo(resProfile)
      ElMessage.success('资料已更新')
      isEdit.value = false
    } catch {
      ElMessage.error('资料更新失败')
    }
  }

  const editPwd = async () => {
    if (!isEditPwd.value) {
      isEditPwd.value = true
      return
    }
    try {
      await fetchUpdatePassword({
        old_password: pwdForm.password || undefined,
        new_password: pwdForm.newPassword,
        confirm_password: pwdForm.confirmPassword
      })
      ElMessage.success('密码已更新')
      isEditPwd.value = false
      pwdForm.password = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
    } catch {
      ElMessage.error('密码更新失败')
    }
  }
</script>

<style lang="scss">
  .user {
    .icon {
      width: 1.4em;
      height: 1.4em;
      overflow: hidden;
      vertical-align: -0.15em;
      fill: currentcolor;
    }
  }
</style>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;

    $box-radius: calc(var(--custom-radius) + 4px);

    .box-style {
      border: 1px solid var(--art-border-color);
    }

    .content {
      position: relative;
      display: flex;
      margin-top: 10px;

      .right-wrap {
        width: 100%;
        display: flex;
        gap: 20px;

        .info {
          background: var(--art-main-bg-color);
          border-radius: $box-radius;
          width: calc(50% - 10px);

          .title {
            padding: 15px 25px;
            font-size: 20px;
            font-weight: 400;
            color: var(--art-text-gray-800);
            border-bottom: 1px solid var(--art-border-color);
          }

          .form {
            box-sizing: border-box;
            padding: 30px 25px;

            > .el-row {
              .el-form-item {
                width: calc(50% - 10px);
              }

              .el-input,
              .el-select {
                width: 100%;
              }
            }

            .right-input {
              margin-left: 20px;
            }

            .el-form-item-right {
              display: flex;
              align-items: center;
              justify-content: end;

              .el-button {
                width: 110px !important;
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad-vertical) {
    .page-content {
      .content {
        display: block;
        margin-top: 5px;

        .right-wrap {
          width: 100%;
          margin-top: 15px;
          display: block;

          .info {
            width: 100% !important;
            margin-bottom: 15px;
          }
        }
      }
    }
  }
</style>
