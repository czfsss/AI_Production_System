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

const navigateTo = (moduleKey: string) => {
  router.push(`/${moduleKey}`)
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
        
        <nav class="nav-menu">
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
</style>
