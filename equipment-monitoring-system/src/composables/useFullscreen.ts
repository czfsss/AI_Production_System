import { ref, onMounted, onUnmounted } from 'vue'

// 扩展Document接口以支持浏览器特定的全屏API
interface DocumentWithFullscreen extends Document {
  webkitFullscreenEnabled?: boolean
  mozFullScreenEnabled?: boolean
  msFullscreenEnabled?: boolean
  webkitExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
  webkitFullscreenElement?: Element
  mozFullScreenElement?: Element
  msFullscreenElement?: Element
}

// 扩展Element接口以支持浏览器特定的全屏API
interface ElementWithFullscreen extends Element {
  webkitRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

export function useFullscreen() {
  const isFullscreen = ref(false)
  const isSupported = ref(false)

  // 检查浏览器是否支持全屏API
  const checkSupport = () => {
    const doc = document as DocumentWithFullscreen
    isSupported.value = !!(
      document.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled
    )
  }

  // 进入全屏
  const enterFullscreen = async () => {
    try {
      const element = document.documentElement as ElementWithFullscreen
      
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen()
      }
    } catch (error) {
      console.error('进入全屏失败:', error)
    }
  }

  // 退出全屏
  const exitFullscreen = async () => {
    try {
      const doc = document as DocumentWithFullscreen
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen()
      }
    } catch (error) {
      console.error('退出全屏失败:', error)
    }
  }

  // 切换全屏状态
  const toggleFullscreen = async () => {
    if (isFullscreen.value) {
      await exitFullscreen()
    } else {
      await enterFullscreen()
    }
  }

  // 更新全屏状态
  const updateFullscreenState = () => {
    const doc = document as DocumentWithFullscreen
    isFullscreen.value = !!(
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    )
  }

  // 监听全屏状态变化
  const handleFullscreenChange = () => {
    updateFullscreenState()
  }

  // 组件挂载时设置事件监听
  onMounted(() => {
    checkSupport()
    updateFullscreenState()

    // 添加各种浏览器的全屏状态变化监听
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  })

  // 组件卸载时清理事件监听
  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  })

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  }
}
