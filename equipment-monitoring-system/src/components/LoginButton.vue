<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// 控制登录弹窗的显示与隐藏
const isLoginDialogVisible = ref(false)

// 控制退出登录确认弹窗的显示与隐藏
const isConfirmLogoutVisible = ref(false)

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

// 确认退出登录
const confirmLogout = () => {
  authStore.logout()
  isConfirmLogoutVisible.value = false
  // 恢复背景滚动
  document.body.style.overflow = ''
}

// 模拟登录功能
const handleLogin = (e: Event) => {
  e.preventDefault()
  // 这里只是模拟登录成功，实际应用中需要调用API
  authStore.login()
  isLoginDialogVisible.value = false
  document.body.style.overflow = ''
}
</script>

<template>
  <div class="login-container">
    <!-- 未登录状态显示登录按钮 -->
    <div v-if="!authStore.isLoggedIn">
      <button class="btn" @click="openLoginDialog">
        登录
      </button>
    </div>

    <!-- 登录状态显示用户信息 (保持原有样式) -->
    <div v-else class="user-section">
      <el-icon size="20"><User /></el-icon>
      <span>用户</span>
      <el-dropdown>
        <el-icon class="cursor-pointer"><Setting /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人设置</el-dropdown-item>
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
        <div class="heading">登录</div>
        <form action="" class="form" @submit="handleLogin">
          <input required class="input" type="email" name="email" id="email" placeholder="账号">
          <input required class="input" type="password" name="password" id="password" placeholder="密码">
          <span class="forgot-password"><a href="#">忘记密码?</a></span>
          <input class="login-button" type="submit" value="登录">
        </form>
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
  -webkit-box-reflect: below 10px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.4));
}

.btn:active {
  scale: 0.92;
}

.btn:hover {
  background: rgb(2,29,78);
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
  background: #F8F9FD;
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
  border-inline: 2px solid #12B1D1;
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
</style>
