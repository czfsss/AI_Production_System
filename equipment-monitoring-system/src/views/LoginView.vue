<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { View, Hide, Monitor, Tools, Reading, User } from '@element-plus/icons-vue'
import { API_CONFIG } from '../config/api'

const router = useRouter()
const authStore = useAuthStore()

// 如果已经登录，直接跳转到主页
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/monitoring')
  }
})

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

// 系统功能展示数据
const systemFeatures = [
  {
    icon: Monitor,
    title: '实时监控',
    description: '24/7设备状态监控，实时数据可视化',
    color: '#409EFF',
    stats: '99.9%可用性'
  },
  {
    icon: Tools,
    title: '智能维修',
    description: 'AI驱动的故障诊断与维修建议',
    color: '#67C23A',
    stats: '秒级响应'
  },
  {
    icon: Reading,
    title: '知识问答',
    description: '专业技术知识库，即时解答疑问',
    color: '#E6A23C',
    stats: '24/7在线'
  }
]

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
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 模拟重置密码功能
const handleResetPassword = (e: Event) => {
  e.preventDefault()
  // 这里只是模拟重置密码成功，实际应用中需要调用API
  isForgotPasswordVisible.value = false
  // 恢复背景滚动
  document.body.style.overflow = ''
  showSuccessNotification('重置密码邮件已发送')
}

// 切换登录/注册模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}

// 显示成功通知
const showSuccessNotification = (message: string = '登录成功！') => {
  // 移除已存在的通知
  const existingNotification = document.querySelector('.success-notification')
  if (existingNotification) {
    document.body.removeChild(existingNotification)
  }
  
  const notification = document.createElement('div')
  notification.className = 'success-notification'
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">✓</div>
      <div class="notification-message">${message}</div>
    </div>
  `
  document.body.appendChild(notification)
  
  // 2.5秒后自动移除通知
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.classList.add('fade-out')
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 500)
    }
  }, 2500)
}

// 显示加载状态
const showLoadingState = (button: HTMLInputElement, _originalText: string) => {
  button.disabled = true
  button.value = '处理中...'
  button.style.cursor = 'not-allowed'
  button.style.opacity = '0.7'
}

// 恢复按钮状态
const restoreButtonState = (button: HTMLInputElement, originalText: string) => {
  button.disabled = false
  button.value = originalText
  button.style.cursor = 'pointer'
  button.style.opacity = '1'
}

// 登录功能
const handleLogin = async (e: Event) => {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)
  const submitButton = form.querySelector('input[type="submit"]') as HTMLInputElement
  
  const loginData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string
  }
  
  // 显示加载状态
  showLoadingState(submitButton, '登录')
  
  try {
    // 调用后端登录API
    const response = await fetch(`${API_CONFIG.baseURL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })
    
    if (response.ok) {
      const userData = await response.json()
      
      // 显示登录成功动画
      showSuccessNotification('登录成功！欢迎回来')
      
      // 添加弹窗消失动画
      const dialogElement = document.querySelector('.custom-dialog-overlay') as HTMLElement
      if (dialogElement) {
        dialogElement.style.animation = 'overlayFadeOut 0.3s ease-out'
      }
      
      // 延迟关闭弹窗和跳转，让用户看到成功反馈
      setTimeout(() => {
        // 登录成功，更新用户状态
        authStore.login(userData)
        isLoginDialogVisible.value = false
        document.body.style.overflow = ''
        
        // 显示跳转提示
        showSuccessNotification('正在进入系统...')
        
        // 再延迟一点跳转，确保状态更新完成
        setTimeout(() => {
          router.push('/monitoring')
        }, 800)
      }, 500)
    } else {
      const errorData = await response.json()
      let errorMessage = '登录失败'
      
      if (response.status === 422) {
        // 处理422验证错误
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // FastAPI验证错误格式
          errorMessage = errorData.detail.map((err: {loc: string[], msg: string}) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ')
        } else {
          errorMessage = errorData.detail || '表单验证失败'
        }
      } else {
        // 处理其他错误
        errorMessage = errorData.detail || '账号或密码错误'
      }
      
      // 恢复按钮状态
      restoreButtonState(submitButton, '登录')
      alert(errorMessage)
    }
  } catch (error) {
    console.error('登录请求失败：', error)
    // 恢复按钮状态
    restoreButtonState(submitButton, '登录')
    alert('登录请求失败，请检查网络连接')
  }
}

// 注册功能
const handleRegister = async (e: Event) => {
  e.preventDefault()
  const form = e.target as HTMLFormElement
  const formData = new FormData(form)
  const submitButton = form.querySelector('input[type="submit"]') as HTMLInputElement
  
  const registerData = {
    nickname: formData.get('nickname') as string,
    username: formData.get('username') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirmPassword') as string
  }
  
  // 显示加载状态
  showLoadingState(submitButton, '注册')
  
  try {
    // 调用后端注册API
    const response = await fetch(`${API_CONFIG.baseURL}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    })
    
    if (response.ok) {
      const userData = await response.json()
      
      // 显示注册成功动画
      showSuccessNotification('注册成功！欢迎加入')
      
      // 添加弹窗消失动画
      const dialogElement = document.querySelector('.custom-dialog-overlay') as HTMLElement
      if (dialogElement) {
        dialogElement.style.animation = 'overlayFadeOut 0.3s ease-out'
      }
      
      // 延迟关闭弹窗和跳转
      setTimeout(() => {
        // 注册成功，自动登录
        authStore.login(userData)
        isLoginDialogVisible.value = false
        document.body.style.overflow = ''
        
        // 显示跳转提示
        showSuccessNotification('正在进入系统...')
        
        // 再延迟一点跳转
        setTimeout(() => {
          router.push('/monitoring')
        }, 800)
      }, 500)
    } else {
      const errorData = await response.json()
      let errorMessage = '注册失败'
      
      if (response.status === 422) {
        // 处理422验证错误
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // FastAPI验证错误格式
          errorMessage = errorData.detail.map((err: {loc: string[], msg: string}) => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ')
        } else {
          errorMessage = errorData.detail || '表单验证失败'
        }
      } else {
        // 处理其他错误
        errorMessage = errorData.detail || '未知错误'
      }
      
      // 恢复按钮状态
      restoreButtonState(submitButton, '注册')
      alert(errorMessage)
    }
  } catch (error) {
    console.error('注册请求失败：', error)
    // 恢复按钮状态
    restoreButtonState(submitButton, '注册')
    alert('注册请求失败，请检查网络连接')
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 动态背景 -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape1"></div>
        <div class="shape shape2"></div>
        <div class="shape shape3"></div>
        <div class="shape shape4"></div>
        <div class="shape shape5"></div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 系统标题和logo -->
      <div class="header-section">
        <div class="logo-container">
          <el-icon size="64" color="white"><Monitor /></el-icon>
          <div class="title-section">
            <h1 class="main-title">智能设备监控与维修辅助系统</h1>
            <p class="subtitle">AI Production System</p>
          </div>
        </div>
      </div>

          <!-- 登录区域 -->
          <div class="login-section">
            <div class="login-card">
              <h2>开始使用系统</h2>
              <p>点击下方按钮登录或注册账户</p>
              <button class="login-btn" @click="openLoginDialog">
                <el-icon size="20"><User /></el-icon>
                立即登录
              </button>
            </div>
          </div>

          <!-- 系统功能展示 -->
          <div class="features-section">
            <div class="features-container">
              <div
                v-for="(feature, index) in systemFeatures"
                :key="feature.title"
                class="feature-card"
                :style="{ animationDelay: `${index * 0.2}s` }"
              >
                <div class="feature-icon" :style="{ backgroundColor: feature.color }">
                  <el-icon size="32" color="white">
                    <component :is="feature.icon" />
                  </el-icon>
                </div>
                <div class="feature-content">
                  <h3>{{ feature.title }}</h3>
                  <p>{{ feature.description }}</p>
                  <div class="feature-stats">{{ feature.stats }}</div>
                </div>
              </div>
            </div>
          </div>

      <!-- 底部信息 -->
      <div class="footer-section">
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">系统可用性</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">全天候监控</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">AI</div>
            <div class="stat-label">智能诊断</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录弹窗 (保持原有样式) -->
    <div v-if="isLoginDialogVisible" class="custom-dialog-overlay">
      <div class="container">
        <button class="close-button" @click="closeLoginDialog">×</button>
        <div class="heading">{{ isLoginMode ? '登录' : '注册' }}</div>
        <template v-if="isLoginMode">
          <form action="" class="form" @submit="handleLogin">
            <input required class="input" type="text" name="username" id="username" placeholder="工号(7位数字)" maxlength="7" pattern="\d{7}">
            <div class="password-input-container">
              <input required class="input" :type="showPassword ? 'text' : 'password'" name="password" id="password" placeholder="密码">
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <span v-if="showPassword"><Hide size="18" /></span>
                <span v-else><View size="18" /></span>
              </button>
            </div>
            <span class="forgot-password"><a href="#" @click.prevent="openForgotPassword">忘记密码?</a></span>
            <input class="login-button" type="submit" value="登录">
          </form>
        </template>
        <template v-else>
          <form action="" class="form" @submit="handleRegister">
            <input required class="input" type="text" name="nickname" id="nickname" placeholder="昵称">
            <input required class="input" type="text" name="username" id="username" placeholder="工号(7位数字)" maxlength="7" pattern="\d{7}">
            <div class="password-input-container">
              <input required class="input" :type="showRegisterPassword ? 'text' : 'password'" name="password" id="register-password" placeholder="密码">
              <button type="button" class="password-toggle" @click="showRegisterPassword = !showRegisterPassword">
                <span v-if="showRegisterPassword"><Hide size="18" /></span>
                <span v-else><View size="18" /></span>
              </button>
            </div>
            <div class="password-input-container">
              <input required class="input" :type="showConfirmPassword ? 'text' : 'password'" name="confirmPassword" id="confirm-password" placeholder="确认密码">
              <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                <span v-if="showConfirmPassword"><Hide size="18" /></span>
                <span v-else><View size="18" /></span>
              </button>
            </div>
            <input class="login-button" type="submit" value="注册">
          </form>
        </template>
        <div class="switch-mode">
          {{ isLoginMode ? '还没有账号?' : '已有账号?' }} <a href="#" @click.prevent="toggleMode">{{ isLoginMode ? '立即注册' : '返回登录' }}</a>
        </div>
      </div>
    </div>

    <!-- 忘记密码弹窗 (保持原有样式) -->
    <div v-if="isForgotPasswordVisible" class="custom-dialog-overlay">
      <div class="container">
        <button class="close-button" @click="closeForgotPassword">×</button>
        <div class="heading">忘记密码</div>
        <form action="" class="form" @submit="handleResetPassword">
          <input required class="input" type="email" name="email" id="forgot-email" placeholder="请输入您的邮箱">
          <input class="login-button" type="submit" value="发送重置链接">
        </form>
            <div class="switch-mode">
              <a href="#" @click.prevent="() => { closeForgotPassword(); openLoginDialog(); }">返回登录</a>
            </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主页面样式 */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #2d1b69 100%);
  overflow: hidden;
  position: relative;
}

/* 动态背景 */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.1));
  animation: float 6s ease-in-out infinite;
}

.shape1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape3 {
  width: 60px;
  height: 60px;
  top: 10%;
  right: 25%;
  animation-delay: 4s;
}

.shape4 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 1s;
}

.shape5 {
  width: 150px;
  height: 150px;
  top: 40%;
  left: 50%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
}

/* 主要内容 */
.main-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  color: white;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 60px;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.title-section {
  text-align: center;
}

.main-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(79, 172, 254, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

.subtitle {
  font-size: 24px;
  font-weight: 300;
  margin: 10px 0 0 0;
  opacity: 0.9;
  letter-spacing: 2px;
}

@keyframes glow {
  from {
    text-shadow: 0 0 20px rgba(79, 172, 254, 0.5);
  }
  to {
    text-shadow: 0 0 30px rgba(79, 172, 254, 0.8), 0 0 40px rgba(0, 242, 254, 0.5);
  }
}

/* 功能展示区域 */
.features-section {
  margin-bottom: 60px;
}

.features-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(79, 172, 254, 0.3);
  border-color: rgba(79, 172, 254, 0.5);
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.feature-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: white;
}

.feature-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.feature-stats {
  font-size: 12px;
  font-weight: 600;
  color: #4facfe;
  background: rgba(79, 172, 254, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
}

/* 登录区域 */
.login-section {
  margin-bottom: 60px;
}

.login-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 1s ease-out 0.5s forwards;
  opacity: 0;
  transform: translateY(30px);
}

.login-card h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: white;
}

.login-card p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 30px 0;
}

.login-btn {
  font-size: 18px;
  padding: 16px 40px;
  border: none;
  outline: none;
  border-radius: 12px;
  cursor: pointer;
  text-transform: uppercase;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  letter-spacing: 1px;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(79, 172, 254, 0.5);
  background: linear-gradient(45deg, #00f2fe 0%, #4facfe 100%);
}

.login-btn:active {
  transform: translateY(-1px);
}

/* 底部统计 */
.footer-section {
  margin-top: auto;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  animation: slideUp 1.2s ease-out 1s forwards;
  opacity: 0;
  transform: translateY(30px);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #4facfe;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  font-weight: 500;
}

/* 优化后的弹窗样式 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes overlayFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.container {
  max-width: 450px;
  width: 90vw;
  background: rgba(248, 249, 253, 0.95);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(244, 247, 251, 0.9) 100%);
  border-radius: 24px;
  padding: 40px 45px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(79, 172, 254, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  position: relative;
  margin: 20px;
  backdrop-filter: blur(20px);
  animation: containerSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes containerSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.close-button:hover {
  background: rgba(255, 255, 255, 1);
  color: #333;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.heading {
  text-align: center;
  font-weight: 700;
  font-size: 32px;
  background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 10px;
  margin-bottom: 30px;
  text-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
}

.form {
  margin-top: 20px;
}

.form .input {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(79, 172, 254, 0.2);
  padding: 16px 22px;
  border-radius: 16px;
  margin-top: 18px;
  box-shadow: 
    0 4px 16px rgba(79, 172, 254, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  font-size: 16px;
  backdrop-filter: blur(10px);
}

.form .input::placeholder {
  color: rgba(107, 114, 128, 0.8);
  font-weight: 500;
}

.form .input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 
    0 4px 20px rgba(79, 172, 254, 0.2),
    0 0 0 3px rgba(79, 172, 254, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
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
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(79, 172, 254, 0.1);
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 50%;
  cursor: pointer;
  color: #4facfe;
  padding: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.15);
  backdrop-filter: blur(10px);
}

.password-toggle:hover {
  background: rgba(79, 172, 254, 0.2);
  border-color: #4facfe;
  color: #00f2fe;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
  color: rgba(79, 172, 254, 0.8);
  font-weight: 500;
}

.switch-mode a {
  color: #4facfe;
  text-decoration: none;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.switch-mode a:hover {
  color: #00f2fe;
  background: rgba(79, 172, 254, 0.1);
  text-decoration: none;
}

.form .forgot-password {
  display: block;
  margin-top: 12px;
  margin-left: 10px;
}

.form .forgot-password a {
  font-size: 13px;
  color: #4facfe;
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.form .forgot-password a:hover {
  color: #00f2fe;
  background: rgba(79, 172, 254, 0.1);
}

.form .login-button {
  display: block;
  width: 100%;
  font-weight: 600;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 18px 24px;
  margin: 25px auto 20px auto;
  border-radius: 16px;
  box-shadow: 
    0 10px 25px rgba(79, 172, 254, 0.4),
    0 4px 10px rgba(0, 242, 254, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-size: 17px;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.form .login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.form .login-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 15px 35px rgba(79, 172, 254, 0.5),
    0 8px 15px rgba(0, 242, 254, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
}

.form .login-button:hover::before {
  left: 100%;
}

.form .login-button:active {
  transform: translateY(0);
  box-shadow: 
    0 8px 20px rgba(79, 172, 254, 0.4),
    0 4px 8px rgba(0, 242, 254, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 成功通知样式 */
.success-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
  padding: 16px 24px;
  box-shadow: 
    0 4px 20px rgba(82, 196, 26, 0.3),
    0 2px 8px rgba(115, 209, 61, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: slideDownBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.5s ease-out;
  font-weight: 600;
  font-size: 16px;
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  width: 100%;
}

.success-notification.fade-out {
  opacity: 0;
  transform: translateY(-100%);
}

.notification-icon {
  font-size: 18px;
  font-weight: bold;
  margin-right: 12px;
  background: rgba(255, 255, 255, 0.25);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
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

@keyframes slideInBounce {
  0% {
    transform: translateX(100%) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateX(-10px) scale(1.05);
    opacity: 1;
  }
  80% {
    transform: translateX(5px) scale(0.98);
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes slideDownBounce {
  0% {
    transform: translateY(-100%) scale(0.95);
    opacity: 0;
  }
  60% {
    transform: translateY(10px) scale(1.02);
    opacity: 1;
  }
  80% {
    transform: translateY(-5px) scale(0.99);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-title {
    font-size: 32px;
  }
  
  .subtitle {
    font-size: 18px;
  }
  
  .features-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .feature-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .stats-container {
    gap: 30px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .login-btn {
    font-size: 16px;
    padding: 14px 32px;
  }
  
  .success-notification {
    top: 0;
    left: 0;
    right: 0;
    padding: 14px 20px;
    font-size: 15px;
  }
  
  .notification-message {
    font-size: 15px;
  }
  
  .notification-icon {
    width: 24px;
    height: 24px;
    font-size: 16px;
    margin-right: 10px;
  }

  /* 弹窗移动端适配 */
  .container {
    max-width: 380px;
    width: 95vw;
    padding: 35px 30px;
    margin: 10px;
  }

  .heading {
    font-size: 28px;
    margin-bottom: 25px;
  }

  .form .input {
    padding: 14px 18px;
    font-size: 16px;
  }

  .form .login-button {
    padding: 16px 20px;
    font-size: 16px;
  }

  .close-button {
    top: 15px;
    right: 15px;
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 15px;
  }
  
  .header-section {
    margin-bottom: 40px;
  }
  
  .main-title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 16px;
  }
  
  .features-section {
    margin-bottom: 40px;
  }
  
  .login-section {
    margin-bottom: 40px;
  }
  
  .login-card h2 {
    font-size: 24px;
  }
  
  .login-card p {
    font-size: 14px;
  }
  
  .stats-container {
    gap: 20px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 12px;
  }
}
</style>
