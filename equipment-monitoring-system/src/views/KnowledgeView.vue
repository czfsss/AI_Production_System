<script setup lang="ts">
// 导入必要的库
import { ref } from 'vue'

// 定义智能体数据
const agents = [
  {
    id: 'process',
    name: '工艺问答',
    src: 'http://10.43.32.231:1130/chatbot/rOK3d8Jw8zm8Ur7p'
  },
  {
    id: 'system',
    name: '制度问答',
    src: 'http://10.43.32.231:1130/chatbot/9PYF45N0JkpQIoQp'
  },
  {
    id: 'safety',
    name: '安全问答',
    src: 'http://10.43.32.231:1130/chatbot/safety'
  }
]

// 当前选中的智能体
const selectedAgent = ref(agents[0])

// 切换智能体
const switchAgent = (agent: any) => {
  selectedAgent.value = agent
}
</script>

<template>
  <div class="knowledge-container">
    <div class="sidebar">
      <h3 class="sidebar-title">智能体选择</h3>
      <div class="agent-list">
        <button v-for="agent in agents" :key="agent.id" class="agent-btn" :class="{ active: selectedAgent.id === agent.id }" @click="switchAgent(agent)">
          {{ agent.name }}
        </button>
      </div>
    </div>
    <div class="iframe-container">
      <iframe :src="selectedAgent.src" frameborder="0" width="100%" height="100%"></iframe>
    </div>
  </div>
</template>

<style scoped>
.knowledge-container {
  display: flex;
  height: calc(100vh - 64px); /* 减去顶部导航栏高度 */
  width: 100%;
  box-sizing: border-box;
  padding-bottom: 16px;
}

.sidebar {
  width: 220px;
  background-color: #f0f5ff;
  border-right: 1px solid #e5e6eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  border-radius: 8px 0 0 8px;
  margin: 8px 0 8px 8px; /* 只在左、上、下设置边距，移除右边距 */
  height: 100%;
  box-sizing: border-box;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e6eb;
  color: #1d2129;
  background-color: #e6f0ff;
  padding: 8px 12px;
  border-radius: 0 8px 8px 0;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-btn {
  padding: 10px 12px;
  text-align: left;
  background-color: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.agent-btn:hover {
  background-color: #e6f0ff;
  border-color: #c6e2ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.agent-btn.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.iframe-container {
  flex: 1;
  height: 100%;
  overflow: hidden;
  border-radius: 0 8px 8px 0;
  margin: 8px 8px 8px 0; /* 只在右、上、下设置边距，移除左边距 */
  box-sizing: border-box;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
