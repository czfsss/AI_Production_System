import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

export function useAuth() {
  const showLoginPrompt = ref(false)
  const authStore = useAuthStore()

  const requireAuth = (callback: () => void) => {
    // 使用auth store检查登录状态
    if (!authStore.isLoggedIn) {
      showLoginPrompt.value = true
      return
    }
    callback()
  }

  const openLoginDialog = () => {
    showLoginPrompt.value = false
    // 触发LoginButton组件的登录弹窗
    const loginButton = document.querySelector('.btn') as HTMLElement
    if (loginButton) {
      loginButton.click()
    }
  }

  return {
    showLoginPrompt,
    requireAuth,
    openLoginDialog
  }
}
