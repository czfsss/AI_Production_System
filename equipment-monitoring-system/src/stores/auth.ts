import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface UserInfo {
  username: string
  nickname: string
}

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const userInfo = ref<UserInfo | null>(null)
  
  function login(userData?: UserInfo) {
    isLoggedIn.value = true
    if (userData) {
      userInfo.value = userData
    }
  }
  
  function logout() {
    isLoggedIn.value = false
    userInfo.value = null
  }
  
  return { 
    isLoggedIn, 
    userInfo, 
    login, 
    logout 
  }
})
