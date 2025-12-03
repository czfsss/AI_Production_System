<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown, View, Hide, Setting } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { API_CONFIG } from '../config/api'
import { api } from '../utils/httpClient'
import UserProfileDialog from './UserProfileDialog.vue'

const authStore = useAuthStore()
const router = useRouter()

// 控制登录弹窗的显示与隐藏
const isLoginDialogVisible = ref(false)

// 控制显示登录还是注册表单
const isLoginMode = ref(true)

// 控制密码显示/隐藏
const showPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

// 控制忘记密码弹窗的显示与隐藏
const isForgotPasswordVisible = ref(false)
// 重置密码表单数据
const resetPasswordForm = reactive({
  username: '',
  securityAnswer: '安全第一、预防为主、综合治理',
  newPassword: '',
  confirmPassword: '',
})
// 重置密码相关状态
const isResetingPassword = ref(false)
const showResetNewPassword = ref(false)
const showResetConfirmPassword = ref(false)

// 控制退出登录确认弹窗的显示与隐藏
const isConfirmLogoutVisible = ref(false)
// 控制用户个人设置弹窗的显示与隐藏
const isUserProfileVisible = ref(false)

// 打开登录弹窗
const openLoginDialog = () => {
  isLoginDialogVisible.value = true
  // 防止背景滚动
  document.body.style.overflow = 'hidden'
}

// 关闭登录弹窗
const closeLoginDialog = () => {
  isLoginDialogVisible.value = false
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 打开忘记密码弹窗
const openForgotPassword = () => {
  isLoginDialogVisible.value = false
  isForgotPasswordVisible.value = true
  // 防止背景滚动
  document.body.style.overflow = 'hidden'
}

// 关闭忘记密码弹窗
const closeForgotPassword = () => {
  isForgotPasswordVisible.value = false
  // 清空表单
  resetPasswordForm.username = ''
  resetPasswordForm.securityAnswer = '安全第一、预防为主、综合治理'
  resetPasswordForm.newPassword = ''
  resetPasswordForm.confirmPassword = ''
  // 重置状态
  isResetingPassword.value = false
  showResetNewPassword.value = false
  showResetConfirmPassword.value = false
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 打开退出登录确认弹窗
const openConfirmLogout = () => {
  isConfirmLogoutVisible.value = true
  // 防止背景滚动
  document.body.style.overflow = 'hidden'
}

// 关闭退出登录确认弹窗
const closeConfirmLogout = () => {
  isConfirmLogoutVisible.value = false
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 打开个人设置弹窗
const openUserProfile = () => {
  isUserProfileVisible.value = true
}

// 关闭个人设置弹窗
const closeUserProfile = () => {
  isUserProfileVisible.value = false
}

// 处理重置密码
const handleResetPassword = async (event: Event) => {
  event.preventDefault()

  // 验证两次密码输入
  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  // 验证工号格式
  if (!/^\d{7}$/.test(resetPasswordForm.username)) {
    ElMessage.error('工号必须为7位数字')
    return
  }

  // 验证密码长度
  if (resetPasswordForm.newPassword.length < 8) {
    ElMessage.error('密码长度至少8位')
    return
  }

  try {
    isResetingPassword.value = true

    const { userService } = await import('../services/user')
    await userService.resetPassword({
      username: resetPasswordForm.username,
      security_answer: resetPasswordForm.securityAnswer,
      new_password: resetPasswordForm.newPassword,
      confirm_password: resetPasswordForm.confirmPassword,
    })

    ElMessage.success('密码重置成功！请使用新密码登录')
    closeForgotPassword()
    openLoginDialog()
  } catch (error: unknown) {
    console.error('重置密码失败:', error)
    const message = (error as Error).message || '重置密码失败'
    ElMessage.error(message)
  } finally {
    isResetingPassword.value = false
  }
}

// 处理用户信息更新（密码修改后需要重新登录）
const handleUserUpdated = () => {
  // 密码修改成功后，清除登录状态，让用户重新登录
  setTimeout(() => {
    authStore.logout()
    ElMessage.info('请使用新密码重新登录')
  }, 1000)
}

// 确认退出登录
const confirmLogout = async () => {
  try {
    // 调用后端退出登录API（如果用户已登录）
    if (authStore.isLoggedIn) {
      const { userService } = await import('../services/user')
      await userService.logout()
    }
  } catch (error) {
    console.warn('后端退出登录失败，但将继续清除本地状态:', error)
  } finally {
    // 无论后端调用是否成功，都清除本地登录状态
    authStore.logout()
    isConfirmLogoutVisible.value = false
    // 恢复背景滚动
    document.body.style.overflow = ''
    ElMessage.success('已退出登录')
  }
}

// 切换登录/注册模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}

// 登录功能
const handleLogin = async (e: Event) => {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)

  const loginData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  }

  try {
    // 调用后端登录API
    const userData = await api.post('/api/user/login', loginData)

    // 登录成功，更新用户状态
    authStore.login(userData)
    isLoginDialogVisible.value = false
    document.body.style.overflow = ''

    // 显示成功消息并跳转
    ElMessage.success('登录成功！')

    // 立即跳转到监控页面
    router.push('/monitoring')
  } catch (error: any) {
    console.error('登录请求失败：', error)
    const message = error.message || '登录请求失败，请检查网络连接'
    alert(message)
  }
}

// 显示成功通知
const showSuccessNotification = () => {
  const notification = document.createElement('div')
  notification.className = 'success-notification'
  notification.innerHTML = `
    <div class="notification-icon">✓</div>
    <div class="notification-message">登录成功！</div>
  `
  document.body.appendChild(notification)

  // 3秒后自动移除通知
  setTimeout(() => {
    notification.classList.add('fade-out')
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 500)
  }, 3000)
}

// 注册功能
const handleRegister = async (e: Event) => {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)

  const registerData = {
    nickname: formData.get('nickname') as string,
    username: formData.get('username') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirmPassword') as string,
  }

  try {
    // 调用后端注册API
    const userData = await api.post('/api/user/register', registerData)

    // 注册成功，自动登录
    authStore.login(userData)
    isLoginDialogVisible.value = false
    document.body.style.overflow = ''
    showSuccessNotification()
  } catch (error: any) {
    console.error('注册请求失败：', error)
    const message = error.message || '注册请求失败，请检查网络连接'
    alert(message)
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 未登录状态显示登录按钮 -->
    <div v-if="!authStore.isLoggedIn">
      <button class="btn" @click="$router.push('/login')">登录</button>
    </div>

    <!-- 登录状态显示用户信息 (保持原有样式) -->
    <div v-else class="user-section">
      <el-icon size="20"><User /></el-icon>
      <span>{{ authStore.userInfo?.nickname || '用户' }}</span>
      <el-dropdown>
        <el-icon class="cursor-pointer"><Setting /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="openUserProfile">个人设置</el-dropdown-item>
            <el-dropdown-item>系统设置</el-dropdown-item>
            <el-dropdown-item divided @click="openConfirmLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 自定义登录弹窗 -->
    <div v-if="isLoginDialogVisible" class="custom-dialog-overlay">
      <div class="container">
        <button class="close-button" @click="closeLoginDialog">×</button>
        <div class="heading">{{ isLoginMode ? '登录' : '注册' }}</div>
        <template v-if="isLoginMode">
          <form action="" class="form" @submit="handleLogin">
            <input
              required
              class="input"
              type="text"
              name="username"
              id="username"
              placeholder="工号(7位数字)"
              maxlength="7"
              pattern="\d{7}"
            />
            <div class="password-input-container">
              <input
                required
                class="input"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                id="password"
                placeholder="密码"
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <span v-if="showPassword"><Hide size="18" /></span>
                <span v-else><View size="18" /></span>
              </button>
            </div>
            <span class="forgot-password"
              ><a href="#" @click.prevent="openForgotPassword">忘记密码?</a></span
            >
            <input class="login-button" type="submit" value="登录" />
          </form>
        </template>
        <template v-else>
          <form action="" class="form" @submit="handleRegister">
            <input
              required
              class="input"
              type="text"
              name="nickname"
              id="nickname"
              placeholder="昵称"
            />
            <input
              required
              class="input"
              type="text"
              name="username"
              id="username"
              placeholder="工号(7位数字)"
              maxlength="7"
              pattern="\d{7}"
            />
            <div class="password-input-container">
              <input
                required
                class="input"
                :type="showRegisterPassword ? 'text' : 'password'"
                name="password"
                id="register-password"
                placeholder="密码"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showRegisterPassword = !showRegisterPassword"
              >
                <span v-if="showRegisterPassword"><Hide size="18" /></span>
                <span v-else><View size="18" /></span>
              </button>
            </div>
            <div class="password-input-container">
              <input
                required
                class="input"
                :type="showConfirmPassword ? 'text' : 'password'"
                name="confirmPassword"
                id="confirm-password"
                placeholder="确认密码"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <span v-if="showConfirmPassword"><Hide size="18" /></span>
                <span v-else><View size="18" /></span>
              </button>
            </div>
            <input class="login-button" type="submit" value="注册" />
          </form>
        </template>
        <div class="switch-mode">
          {{ isLoginMode ? '还没有账号?' : '已有账号?' }}
          <a href="#" @click.prevent="toggleMode">{{ isLoginMode ? '立即注册' : '返回登录' }}</a>
        </div>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <div v-if="isForgotPasswordVisible" class="custom-dialog-overlay">
      <div class="container">
        <button class="close-button" @click="closeForgotPassword">×</button>
        <div class="heading">重置密码</div>
        <form @submit.prevent="handleResetPassword" class="form">
          <input
            required
            class="input"
            type="text"
            v-model="resetPasswordForm.username"
            placeholder="请输入工号(7位数字)"
            maxlength="7"
            pattern="\d{7}"
          />

          <div class="security-question">
            <label class="question-label">安全问题：</label>
            <p class="question-text">淮阴卷烟厂的安全生产管理方针是什么？</p>
            <input
              required
              class="input"
              type="text"
              v-model="resetPasswordForm.securityAnswer"
              placeholder="请输入答案"
            />
          </div>

          <div class="password-input-container">
            <input
              required
              class="input"
              :type="showResetNewPassword ? 'text' : 'password'"
              v-model="resetPasswordForm.newPassword"
              placeholder="新密码(至少8位)"
              minlength="8"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showResetNewPassword = !showResetNewPassword"
            >
              <span v-if="showResetNewPassword"><Hide size="18" /></span>
              <span v-else><View size="18" /></span>
            </button>
          </div>

          <div class="password-input-container">
            <input
              required
              class="input"
              :type="showResetConfirmPassword ? 'text' : 'password'"
              v-model="resetPasswordForm.confirmPassword"
              placeholder="确认新密码"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showResetConfirmPassword = !showResetConfirmPassword"
            >
              <span v-if="showResetConfirmPassword"><Hide size="18" /></span>
              <span v-else><View size="18" /></span>
            </button>
          </div>

          <button class="login-button" type="submit" :disabled="isResetingPassword">
            {{ isResetingPassword ? '重置中...' : '重置密码' }}
          </button>
        </form>
        <div class="switch-mode">
          <a
            href="#"
            @click.prevent="
              () => {
                closeForgotPassword()
                openLoginDialog()
              }
            "
            >返回登录</a
          >
        </div>
      </div>
    </div>

    <!-- 退出登录确认弹窗 -->
    <div v-if="isConfirmLogoutVisible" class="custom-dialog-overlay">
      <div class="confirm-container">
        <div class="confirm-heading">确认退出</div>
        <div class="confirm-message">确定要退出登录吗？</div>
        <div class="confirm-buttons">
          <button class="cancel-button" @click="closeConfirmLogout">取消</button>
          <button class="confirm-button" @click="confirmLogout">确定</button>
        </div>
      </div>
    </div>

    <!-- 用户个人设置弹窗 -->
    <UserProfileDialog
      :visible="isUserProfileVisible"
      @close="closeUserProfile"
      @updated="handleUserUpdated"
    />
  </div>
</template>

<style scoped>
/* 登录按钮样式 */
.btn {
  font-size: 1rem; /* 减小字体大小 */
  padding: 0.6rem 2rem; /* 减小内边距 */
  border: none;
  outline: none;
  border-radius: 0.8rem;
  cursor: pointer;
  text-transform: uppercase;
  background-color: rgb(35, 35, 233);
  color: rgb(234, 234, 234);
  font-weight: 700;
  transition: 0.6s;
  box-shadow: 0px 0px 60px #1f4c65;
  -webkit-box-reflect: below 10px linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.4));
}

.btn:active {
  scale: 0.92;
}

.btn:hover {
  background: rgb(2, 29, 78);
  background: linear-gradient(270deg, rgba(2, 29, 78, 0.681) 0%, rgba(31, 215, 232, 0.873) 60%);
  color: rgb(4, 4, 38);
}

/* 自定义弹窗样式 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.container {
  max-width: 350px;
  background: #f8f9fd;
  background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
  border-radius: 40px;
  padding: 25px 35px;
  border: 5px solid rgb(255, 255, 255);
  box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
  position: relative;
  margin: 20px;
}

.confirm-container {
  max-width: 300px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.confirm-heading {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.confirm-message {
  margin-bottom: 20px;
  color: #666;
}

.confirm-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.cancel-button {
  padding: 8px 20px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: #f5f5f5;
}

.confirm-button {
  padding: 8px 20px;
  border: none;
  background-color: #ff4d4f;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-button:hover {
  background-color: #ff7875;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.close-button:hover {
  color: #333;
}

.heading {
  text-align: center;
  font-weight: 900;
  font-size: 30px;
  color: rgb(16, 137, 211);
  margin-top: 10px;
}

.form {
  margin-top: 20px;
}

.form .input {
  width: 100%;
  background: white;
  border: none;
  padding: 15px 20px;
  border-radius: 20px;
  margin-top: 15px;
  box-shadow: #cff0ff 0px 10px 10px -5px;
  border-inline: 2px solid transparent;
}

.form .input::placeholder {
  color: rgb(170, 170, 170);
}

.form .input:focus {
  outline: none;
  border-inline: 2px solid #12b1d1;
}

/* 密码输入框容器 */
.password-input-container {
  position: relative;
  width: 100%;
  margin-top: 15px;
}

.password-input-container .input {
  width: 100%;
  padding-right: 40px;
  margin-top: 0;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(151, 224, 234, 0.8);
  border: 1px solid #0099ff;
  border-radius: 50%;
  cursor: pointer;
  color: #0099ff;
  padding: 8px;
  width: 1px;
  height: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 153, 255, 0.2);
}

.password-toggle:hover {
  color: #12b1d1;
  background: white;
  border-color: #12b1d1;
  box-shadow: 0 2px 8px rgba(18, 177, 209, 0.3);
}

.switch-mode {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.switch-mode a {
  color: #0099ff;
  text-decoration: none;
  font-weight: bold;
}

.switch-mode a:hover {
  text-decoration: underline;
}

.form .forgot-password {
  display: block;
  margin-top: 10px;
  margin-left: 10px;
}

.form .forgot-password a {
  font-size: 11px;
  color: #0099ff;
  text-decoration: none;
}

.form .login-button {
  display: block;
  width: 100%;
  font-weight: bold;
  background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
  color: white;
  padding-block: 15px;
  margin: 20px auto;
  border-radius: 20px;
  box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 20px 10px -15px;
  border: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.form .login-button:hover {
  transform: scale(1.03);
  box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 23px 10px -20px;
}

.form .login-button:active {
  transform: scale(0.95);
  box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 15px 10px -10px;
}

/* 保持原有用户区域样式 */
.user-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}

/* 成功通知样式 */
.success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(45deg, #4caf50, #8bc34a);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
  transition: opacity 0.5s ease-out;
}

.success-notification.fade-out {
  opacity: 0;
}

.notification-icon {
  font-size: 20px;
  font-weight: bold;
  margin-right: 10px;
  background: rgba(255, 255, 255, 0.2);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-message {
  font-size: 16px;
  font-weight: 500;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .btn {
    font-size: 0.875rem; /* 减小字体大小 */
    padding: 0.5rem 1.5rem; /* 减小内边距 */
    border-radius: 0.6rem; /* 调整圆角 */
    box-shadow: 0px 0px 40px #1f4c65; /* 减小阴影 */
  }

  .success-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    padding: 12px 15px;
  }

  .notification-message {
    font-size: 14px;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .btn {
    font-size: 0.8rem; /* 进一步减小字体大小 */
    padding: 0.4rem 1.2rem; /* 进一步减小内边距 */
    border-radius: 0.5rem; /* 进一步调整圆角 */
    box-shadow: 0px 0px 30px #1f4c65; /* 进一步减小阴影 */
  }
}

/* 安全问题样式 */
.security-question {
  margin: 15px 0;
  text-align: left;
}

.question-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.question-text {
  font-size: 13px;
  color: #666;
  margin: 8px 0 12px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
  line-height: 1.4;
}
</style>
