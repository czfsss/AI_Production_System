<script setup lang="ts">
// 导入必要的库
import { ref } from 'vue'

// 定义智能体数据
const agents = [
  {
    id: 'process',
    name: '工艺问答',
    src: 'http://10.43.32.231:1130/chatbot/Z0SFrPZm83VmjHbt'
  },
  {
    id: 'system',
    name: '制度问答',
    src: 'http://10.43.32.231:1130/chatbot/Vw5V3jMVzKGKaJ2p'
  },
  {
    id: 'safety',
    name: '安全问答',
    src: 'http://10.43.32.231:1129/chat/share?shared_id=e90b5844729b11f0b4b91e19e3a98b8c&from=chat&auth=c1ZDFlMTk0MjE4ZTExZjBhNmU4ZGEzOG'
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
  /* box-sizing: border-box; */
  /* padding-bottom: 16px; */
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

/* 移动端适配 */
@media (max-width: 768px) {
  .knowledge-container {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 120px);
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 8px 12px 8px;
    padding: 12px;
  }

  .sidebar-title {
    font-size: 14px;
    margin-bottom: 12px;
    padding: 6px 10px;
    border-radius: 0 6px 6px 0;
  }

  .agent-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .agent-btn {
    padding: 8px 12px;
    font-size: 13px;
    flex: 1;
    min-width: 100px;
    text-align: center;
  }

  .iframe-container {
    height: 500px;
    min-height: 500px;
    border-radius: 8px;
    margin: 0 8px 8px 8px;
    overflow: hidden;
  }
  
  .iframe-container iframe {
    min-height: 500px;
    height: 100%;
  }
}

/* 小屏幕手机适配 */
@media (max-width: 480px) {
  .knowledge-container {
    min-height: calc(100vh - 100px);
  }

  .sidebar {
    margin: 6px 6px 10px 6px;
    padding: 10px;
  }

  .sidebar-title {
    font-size: 13px;
    margin-bottom: 10px;
    padding: 5px 8px;
  }

  .agent-list {
    gap: 6px;
  }

  .agent-btn {
    padding: 6px 10px;
    font-size: 12px;
    min-width: 80px;
  }

  .iframe-container {
    height: 400px;
    margin: 0 6px 6px 6px;
  }
}

/* 平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .knowledge-container {
    height: calc(100vh - 70px);
  }

  .sidebar {
    width: 200px;
    padding: 14px;
    margin: 10px 0 10px 10px;
  }

  .sidebar-title {
    font-size: 15px;
    margin-bottom: 14px;
    padding: 7px 11px;
  }

  .agent-list {
    gap: 10px;
  }

  .agent-btn {
    padding: 9px 11px;
    font-size: 13px;
  }

  .iframe-container {
    margin: 10px 10px 10px 0;
  }
}

/* 横屏模式适配 */
@media (max-width: 768px) and (orientation: landscape) {
  .knowledge-container {
    flex-direction: row;
    width: 100%;
    height: calc(100vh - 50px);
  }

  .sidebar {
    width: 180px;
    height: 100%;
    border-radius: 8px 0 0 8px;
    margin: 6px 0 6px 6px;
  }

  .agent-list {
    flex-direction: column;
    gap: 6px;
  }

  .agent-btn {
    padding: 8px 10px;
    font-size: 12px;
    text-align: left;
  }

  .iframe-container {
    height: 100%;
    border-radius: 0 8px 8px 0;
    margin: 6px 6px 6px 0;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .agent-btn {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-title {
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .iframe-container {
    min-height: 500px;
  }
}
</style>
