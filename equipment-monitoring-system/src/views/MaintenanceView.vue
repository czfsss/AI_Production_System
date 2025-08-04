<script setup lang="ts">
import { Box } from '@element-plus/icons-vue'
</script>

<template>
  <div class="maintenance-view">
    <div class="maintenance-container">
      <!-- 智能故障问答 -->
      <div class="card chat-section">
        <div class="card-header">
          <h2 class="card-title">智能故障问答</h2>
        </div>

        <!-- 修改后的iframe容器 -->
        <div class="iframe-container">
          <iframe
            src="http://10.43.32.231:1130/chatbot/HdzKLVDrl9Cle7mx"
            style="width: 100%; height: 100%;min-height: 700px; border: none; border-radius: 8px;"
            frameborder="0"
            allow="microphone">
          </iframe>
        </div>
      </div>

      <!-- 备件库查询 -->
      <div class="card spare-parts-section">
        <div class="card-header">
          <h2 class="card-title">备件库查询</h2>
          <el-tag type="info">功能开发中</el-tag>
        </div>
        <div class="placeholder-content">
          <el-icon size="48" color="#d1d5db"><Box /></el-icon>
          <p>备件库查询功能正在开发中，敬请期待...</p>
          <p style="color: #6b7280; font-size: 14px;">
            该功能将支持：<br>
            • 备件库存查询<br>
            • 备件规格查看<br>
            • 库存预警提醒<br>
            • 备件申领流程
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-view {
  box-sizing: border-box;
  padding: 20px;
  width: 100%;
  min-height: 100vh; /* 关键修改 */
}

.maintenance-container {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 100%;
}

.chat-section,
.spare-parts-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 700px; /* 确保最小高度 */
}

.card {
  display: flex;
  flex-direction: column;
  flex: 1; /* 关键修改 */
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 18px 20px;
  border-bottom: 1px solid #e4e7ed;
}

/* 重写的iframe容器样式 */
.iframe-container {
  flex: 1; /* 占据剩余空间 */
  min-height: 0; /* 允许收缩 */
  display: flex; /* 新增 */
  background: white;
  border-radius: 0 0 4px 4px;
}

/* 备件占位区域 */
.placeholder-content {
  flex: 1; /* 与左侧区域保持同等高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 1200px) {
  .maintenance-container {
    flex-direction: column;
  }
  
  .chat-section,
  .spare-parts-section {
    min-height: 500px;
  }
}
</style>