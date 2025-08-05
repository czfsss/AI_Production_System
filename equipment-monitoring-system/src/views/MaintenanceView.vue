<script setup lang="ts">
import { Box, Clock } from '@element-plus/icons-vue'
</script>

<template>
  <div class="maintenance-view">
    <div class="maintenance-container">
      <!-- 智能故障问答 -->
      <div class="card chat-section">

        <div class="iframe-container">
          <iframe
            src="http://10.43.32.231:1130/chatbot/HdzKLVDrl9Cle7mx"
            style="width: 100%; height: 100%; min-height: 700px; border: none;"
            frameborder="0"
            allow="microphone">
          </iframe>
        </div>
      </div>

      <!-- 备件库查询 -->
      <div class="card spare-parts-section">
        <div class="section-header">
          <h2 class="section-title">备件库查询</h2>
          <el-tag size="small" effect="dark" type="info">开发中</el-tag>
        </div>
        <div class="placeholder-content">
          <div class="feature-card">
            <el-icon class="feature-icon" size="48"><Box /></el-icon>
            <p class="placeholder-text">备件库查询功能正在开发中</p>
            <p class="feature-list">
              该功能将支持：
            </p>
            <ul>
              <li><el-icon><CircleCheck /></el-icon>备件库存查询</li>
              <li><el-icon><CircleCheck /></el-icon>备件规格查看</li>
              <li><el-icon><CircleCheck /></el-icon>库存预警提醒</li>
              <li><el-icon><CircleCheck /></el-icon>备件申领流程</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-view {
  border-radius: 12px;
  padding: 20px;
  background: #f7f9fc;
}

.maintenance-container {
  display: flex;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-3px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
}

.bg-gradient {
  background: linear-gradient(120deg, #3c8ce7 0%, #00eaff 100%);
  border-radius: 10px; /* 添加顶部圆角 */
}

.section-header.bg-gradient .section-title {
  color: white;
  font-weight: 600;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #1a2b50;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.85);
  font-size: 13px;
}

/* 左侧问答区域 */
.iframe-container {
  flex: 1;
  background: #fafcff;
  padding: 5px;
  border-radius: 16px;
}

/* 右侧备件库区域 */
.placeholder-content {
  padding: 30px;
  height: 100%;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f9fbff;
  border-radius: 16px; /* 增大圆角至16px */
  padding: 30px;
  text-align: center;
}

.feature-icon {
  color: #a4c6f5;
  margin-bottom: 24px;
}

.placeholder-text {
  font-size: 18px;
  color: #4a5a78;
  margin-bottom: 30px;
  font-weight: 500;
}

.feature-list {
  color: #6b7897;
  margin-bottom: 16px;
  font-size: 16px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 300px;
}

li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5a78;
  font-size: 14px;
  text-align: left;
}

@media (max-width: 1200px) {
  .maintenance-container {
    flex-direction: column;
  }
  
  .card {
    min-height: 550px;
  }
}
</style>