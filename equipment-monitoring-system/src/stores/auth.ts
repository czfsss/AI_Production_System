import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface UserInfo {
  username: string
  nickname: string
  create_time?: string
}

interface TokenData {
  access_token: string
  refresh_token: string
  token_type: string
  user_info: UserInfo
}

export const useAuthStore = defineStore('auth', () => {
  // 从localStorage初始化状态
  const savedAccessToken = localStorage.getItem('access_token')
  const savedRefreshToken = localStorage.getItem('refresh_token')
  const savedUserInfo = localStorage.getItem('userInfo')
  
  const accessToken = ref(savedAccessToken)
  const refreshToken = ref(savedRefreshToken)
  const userInfo = ref<UserInfo | null>(savedUserInfo ? JSON.parse(savedUserInfo) : null)
  
  // 计算登录状态
  const isLoggedIn = computed(() => !!accessToken.value && !!userInfo.value)
  
  function login(tokenData: TokenData | UserInfo) {
    if ('access_token' in tokenData) {
      // 新的JWT登录方式
      accessToken.value = tokenData.access_token
      refreshToken.value = tokenData.refresh_token
      userInfo.value = tokenData.user_info
      
      // 保存到localStorage
      localStorage.setItem('access_token', tokenData.access_token)
      localStorage.setItem('refresh_token', tokenData.refresh_token)
      localStorage.setItem('userInfo', JSON.stringify(tokenData.user_info))
    } else {
      // 兼容旧的登录方式
      userInfo.value = tokenData
      localStorage.setItem('userInfo', JSON.stringify(tokenData))
    }
    
    // 移除旧的登录状态标记
    localStorage.removeItem('isLoggedIn')
  }
  
  function logout() {
    accessToken.value = null
    refreshToken.value = null
    userInfo.value = null
    
    // 清除localStorage中的所有认证信息
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('isLoggedIn') // 清除旧的登录状态
    
    // 触发全局事件通知其他组件用户已退出登录
    window.dispatchEvent(new CustomEvent('user-logout'))
  }
  
  function updateTokens(newAccessToken: string, newRefreshToken: string) {
    accessToken.value = newAccessToken
    refreshToken.value = newRefreshToken
    
    localStorage.setItem('access_token', newAccessToken)
    localStorage.setItem('refresh_token', newRefreshToken)
  }
  
  // 获取认证头
  function getAuthHeader() {
    return accessToken.value ? `Bearer ${accessToken.value}` : null
  }
  
  return { 
    isLoggedIn, 
    userInfo,
    accessToken,
    refreshToken,
    login, 
    logout,
    updateTokens,
    getAuthHeader
  }
})
