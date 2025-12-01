<template>
  <div class="login register">
    <LoginLeftView></LoginLeftView>
    <div class="right-wrap">
      <div class="header">
        <ArtLogo class="icon" />
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('register.title') }}</h3>
          <p class="sub-title">{{ $t('register.subTitle') }}</p>
          <ElForm ref="formRef" :model="formData" :rules="rules" label-position="top">
            <ElFormItem prop="username">
              <ElInput v-model.trim="formData.username" placeholder="请输入7位工号" />
            </ElFormItem>

            <ElFormItem prop="department">
              <ElSelect v-model="formData.department" placeholder="请选择部门" style="width: 100%">
                <ElOption
                  v-for="item in departmentOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem prop="realName">
              <ElInput v-model.trim="formData.realName" placeholder="请输入姓名" />
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                v-model.trim="formData.password"
                placeholder="请输入至少8位密码"
                type="password"
                autocomplete="off"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="confirmPassword">
              <ElInput
                v-model.trim="formData.confirmPassword"
                :placeholder="$t('register.placeholder[2]')"
                type="password"
                autocomplete="off"
                @keyup.enter="register"
                show-password
              />
            </ElFormItem>

            <ElFormItem prop="agreement">
              <ElCheckbox v-model="formData.agreement">
                {{ $t('register.agreeText') }}
                <router-link
                  style="color: var(--main-color); text-decoration: none"
                  to="/privacy-policy"
                  >{{ $t('register.privacyPolicy') }}</router-link
                >
              </ElCheckbox>
            </ElFormItem>

            <div style="margin-top: 15px">
              <ElButton
                class="register-btn"
                type="primary"
                @click="register"
                :loading="loading"
                v-ripple
              >
                {{ $t('register.submitBtnText') }}
              </ElButton>
            </div>

            <div class="footer">
              <p>
                {{ $t('register.hasAccount') }}
                <router-link :to="RoutesAlias.Login">{{ $t('register.toLogin') }}</router-link>
              </p>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { RoutesAlias } from '@/router/routesAlias'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { fetchRegister } from '@/api/auth'
  import { useUserStore } from '@/store/modules/user'
  import { fetchGetDepartmentList } from '@/api/system-manage'

  defineOptions({ name: 'Register' })

  const { t } = useI18n()
  const userStore = useUserStore()

  const router = useRouter()
  const formRef = ref<FormInstance>()

  const systemName = AppConfig.systemInfo.name
  const loading = ref(false)
  const departmentOptions = ref<any[]>([])

  const formData = reactive({
    username: '',
    department: '',
    realName: '',
    password: '',
    confirmPassword: '',
    agreement: false
  })

  onMounted(async () => {
    try {
      const res = await fetchGetDepartmentList()
      departmentOptions.value = res.records || []
    } catch (e) {
      console.error('Failed to fetch departments', e)
    }
  })

  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.placeholder[1]')))
    } else {
      if (formData.confirmPassword !== '') {
        formRef.value?.validateField('confirmPassword')
      }
      callback()
    }
  }

  const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.rule[0]')))
    } else if (value !== formData.password) {
      callback(new Error(t('register.rule[1]')))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    username: [
      { required: true, message: '请输入工号', trigger: 'blur' },
      { pattern: /^\d{7}$/, message: '工号必须为7位数字', trigger: 'blur' }
    ],
    department: [
      { required: true, message: '请输入部门', trigger: 'blur' },
      { min: 1, max: 50, message: '部门长度为1-50个字符', trigger: 'blur' }
    ],
    realName: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 1, max: 20, message: '姓名长度为1-20个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, validator: validatePass, trigger: 'blur' },
      { min: 8, message: '密码必须至少为8位', trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    agreement: [
      {
        validator: (rule: any, value: boolean, callback: any) => {
          if (!value) {
            callback(new Error(t('register.rule[4]')))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  })

  const register = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      // 注册请求
      const { access_token, refresh_token, user_info } = await fetchRegister({
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        real_name: formData.realName,
        department: formData.department
      })

      if (!access_token) {
        throw new Error('注册失败 - 未收到token')
      }

      // 存储token和用户信息
      userStore.setToken(access_token, refresh_token)
      userStore.setUserInfo(user_info)
      userStore.setLoginStatus(true)

      ElMessage.success('注册成功')
      router.push('/')
    } catch (error) {
      console.log('注册失败', error)
      ElMessage.error('注册失败，请检查输入信息')
    } finally {
      loading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  @use '../login/index' as login;
  @use './index' as register;
</style>
