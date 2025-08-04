<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Monitor, Tools, Reading, User, Setting } from '@element-plus/icons-vue'

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
  { key: 'knowledge', name: '工艺知识', icon: 'Reading' }
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

        <div class="user-section">
          <el-icon size="20"><User /></el-icon>
          <span>管理员</span>
          <el-dropdown>
            <el-icon class="cursor-pointer"><Setting /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item>系统设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
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
</style>
