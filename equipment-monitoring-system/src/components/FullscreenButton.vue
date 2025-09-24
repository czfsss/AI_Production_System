<template>
  <div class="fullscreen-button" v-if="isSupported">
    <el-tooltip 
      :content="isFullscreen ? '退出全屏' : '进入全屏'" 
      placement="bottom"
    >
      <el-button 
        type="primary" 
        circle 
        @click="toggleFullscreen"
        class="fullscreen-btn"
        size="default"
      >
        <el-icon>
          <FullScreen v-if="!isFullscreen" />
          <Rank v-else />
        </el-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { FullScreen, Rank } from '@element-plus/icons-vue'
import { useFullscreen } from '../composables/useFullscreen'

const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen()
</script>

<style scoped>
.fullscreen-button {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.fullscreen-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05);
}

.fullscreen-btn:focus {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .fullscreen-btn {
    background: rgba(0, 0, 0, 0.1) !important;
    border: 1px solid rgba(0, 0, 0, 0.2) !important;
  }
  
  .fullscreen-btn:hover {
    background: rgba(0, 0, 0, 0.2) !important;
    border-color: rgba(0, 0, 0, 0.3) !important;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .fullscreen-button {
    margin-right: 8px;
  }
  
  .fullscreen-btn {
    width: 36px !important;
    height: 36px !important;
  }
}
</style>
