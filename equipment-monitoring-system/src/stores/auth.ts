import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface UserInfo {
  username: string
  nickname: string
}

export const useAuthStore = defineStore('auth', () => {
  // 从localStorage初始化状态
  const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const savedUserInfo = localStorage.getItem('userInfo')
  
  const isLoggedIn = ref(savedIsLoggedIn)
  const userInfo = ref<UserInfo | null>(savedUserInfo ? JSON.parse(savedUserInfo) : null)
  
  function login(userData?: UserInfo) {
    isLoggedIn.value = true
    if (userData) {
      userInfo.value = userData
      // 保存用户信息到localStorage
      localStorage.setItem('userInfo', JSON.stringify(userData))
    }
    // 保存登录状态到localStorage
    localStorage.setItem('isLoggedIn', 'true')
  }
  
  function logout() {
    isLoggedIn.value = false
    userInfo.value = null
    // 清除localStorage中的登录状态
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userInfo')
  }
  
  return { 
    isLoggedIn, 
    userInfo, 
    login, 
    logout 
  }
})
