<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Monitor, Tools, Reading, User, Setting } from '@element-plus/icons-vue'
// 导入登录按钮组件
import LoginButton from './components/LoginButton.vue'

const router = useRouter()
const route = useRoute()

const activeModule = computed(() => {
  const path = route.path
  if (path.startsWith('/monitoring')) return 'monitoring'
  if (path.startsWith('/maintenance')) return 'maintenance'
  if (path.startsWith('/knowledge')) return 'knowledge'
  return 'monitoring'
})

const modules = [
  { key: 'monitoring', name: '设备监控', icon: 'Monitor' },
  { key: 'maintenance', name: '辅助维修', icon: 'Tools' },
  { key: 'knowledge', name: '智能问答', icon: 'Reading' }
]

// 移动端菜单控制
const menuExpanded = ref(false)

const toggleMenu = () => {
  menuExpanded.value = !menuExpanded.value
}

// 点击导航项后关闭菜单
const navigateTo = (moduleKey: string) => {
  router.push(`/${moduleKey}`)
  menuExpanded.value = false
}
</script>

<template>
  <div class="app-container">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon size="24"><Monitor /></el-icon>
          <h1>智能设备监控与维修辅助系统</h1>
        </div>
        
        <!-- 汉堡菜单按钮 -->
<div class="hamburger-menu" @click="toggleMenu">
  <span></span>
  <span></span>
  <span></span>
</div>

<nav class="nav-menu" :class="{ expanded: menuExpanded }"><!-- 移动端适配结束 -->

          <div 
            v-for="module in modules" 
            :key="module.key"
            :class="['nav-item', { active: activeModule === module.key }]"
            @click="navigateTo(module.key)"
          >
            <el-icon><component :is="module.icon" /></el-icon>
            {{ module.name }}
          </div>
        </nav>

        <!-- 使用登录按钮组件替换原来的用户区域 -->
        <LoginButton />
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* App.vue 特有样式 */
.cursor-pointer {
  cursor: pointer;
}

/* 全局背景样式 */
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f8fa 0%, #99b5e8 100%);
  background-attachment: fixed;
}

/* App.vue 头部样式 */
.app-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-section h1 {
  font-size: 20px;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex: 1;
}

.nav-item {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-header {
    padding: 0 15px;
  }

  .header-content {
    height: 60px;
    padding: 0;
    flex-direction: row;
    gap: 10px;
  }

  .logo-section {
    flex: 1;
    justify-content: flex-start;
  }

  .logo-section h1 {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-menu {
    display: none; /* 隐藏默认导航 */
  }

  /* 汉堡菜单按钮 */
  .hamburger-menu {
    display: block;
    width: 44px;
    height: 44px;
    position: relative;
    cursor: pointer;
  }

  .hamburger-menu span {
    display: block;
    position: absolute;
    height: 3px;
    width: 24px;
    background: white;
    border-radius: 3px;
    left: 10px;
    transition: all 0.3s ease;
  }

  .hamburger-menu span:nth-child(1) {
    top: 12px;
  }

  .hamburger-menu span:nth-child(2) {
    top: 20px;
  }

  .hamburger-menu span:nth-child(3) {
    top: 28px;
  }

  /* 展开的导航菜单 */
  .nav-menu.expanded {
    display: flex;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    flex-direction: column;
    gap: 0;
    padding: 10px 0;
    z-index: 100;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-menu.expanded .nav-item {
    text-align: center;
    padding: 12px 16px;
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .main-content {
    padding: 15px;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .app-header {
    padding: 0 10px;
  }

  .header-content {
    padding: 12px 0;
    gap: 12px;
  }

  .logo-section h1 {
    font-size: 14px;
  }

  .nav-item {
    padding: 10px 12px;
    font-size: 14px;
  }

  .main-content {
    padding: 12px;
  }
}

/* 平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .header-content {
    height: 70px;
  }

  .logo-section h1 {
    font-size: 18px;
  }

  .nav-menu {
    gap: 20px;
  }

  .nav-item {
    padding: 10px 14px;
    font-size: 14px;
  }

  .main-content {
    padding: 18px;
  }
}

/* 横屏模式适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .header-content {
    flex-direction: row;
    height: 50px;
  }

  .nav-menu {
    flex-direction: row;
    gap: 15px;
  }

  .nav-item {
    padding: 8px 12px;
    min-width: 80px;
  }
}
</style>
