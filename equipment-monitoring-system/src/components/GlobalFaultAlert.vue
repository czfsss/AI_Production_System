<template>
  <teleport to="body">
    <transition name="fault-alert">
      <div v-if="showFaultAlert && currentFaultAlert && !isOnMonitoringPage" class="fault-alert-overlay" @click="closeAlert">
        <div class="fault-alert-card" @click.stop>
          <div class="fault-alert-header">
            <div class="fault-alert-icon">
              <el-icon size="24"><Warning /></el-icon>
            </div>
            <div class="fault-alert-title">
              <h3>设备故障警告</h3>
              <div class="fault-name">{{ currentFaultAlert.faultName }}</div>
            </div>
            <div class="fault-alert-time">
              {{ formatTime(currentFaultAlert.timestamp) }}
            </div>
            <button class="fault-alert-close" @click="closeAlert">
              <el-icon><Close /></el-icon>
            </button>
          </div>
          
          <div class="fault-alert-device" v-if="currentFaultAlert.deviceInfo">
            <div class="device-info">
              <span class="device-type">{{ currentFaultAlert.deviceInfo.type }}</span>
              <span class="device-number">{{ currentFaultAlert.deviceInfo.number }}#</span>
              <span class="device-shift">{{ getShiftLabel(currentFaultAlert.deviceInfo.shift) }}</span>
            </div>
          </div>
          
          <div class="fault-alert-content">
            <div class="ai-analysis-section">
              <div class="section-title">
                <el-icon><Cpu /></el-icon>
                <span>AI分析结果</span>
              </div>
              <div class="ai-analysis-content">
                <div v-if="analysisContent" class="analysis-text">
                  <MarkdownRenderer :content="analysisContent" />
                </div>
                <div v-if="isAnalyzing && analysisContent" class="streaming-indicator">
                  <span class="streaming-dot"></span>
                  <span class="streaming-dot"></span>
                  <span class="streaming-dot"></span>
                </div>
                <div v-else-if="isAnalyzing && !analysisContent" class="analysis-loading">
                  <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>AI正在分析故障原因...</p>
                </div>
                <div v-else-if="!analysisContent && !isAnalyzing" class="analysis-prompt">
                  <p>AI正在准备分析...</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="fault-alert-footer">
            <el-button type="primary" @click="goToMonitoring">
              查看监控
            </el-button>
            <el-button @click="closeAlert">
              关闭
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Warning, Close, Cpu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMonitoringStore } from '@/stores/monitoring'
import MarkdownRenderer from './MarkdownRenderer.vue'
import { requestDifyAnalysis, generateMachineName } from '../services/difyAnalysis'

const router = useRouter()
const route = useRoute()
const monitoringStore = useMonitoringStore()

// 计算属性
const showFaultAlert = computed(() => monitoringStore.showFaultAlert)
const currentFaultAlert = computed(() => monitoringStore.currentFaultAlert)
const isOnMonitoringPage = computed(() => route.path === '/monitoring')

// 状态
const isAnalyzing = ref(false)
const analysisContent = ref('')

// 监听AI分析结果的变化
watch(() => currentFaultAlert.value?.aiAnalysis, (newAnalysis, oldAnalysis) => {
  if (newAnalysis !== oldAnalysis) {
    // 只有当新内容比旧内容长时才更新，确保流式效果
    if (!oldAnalysis || (newAnalysis && newAnalysis.length > oldAnalysis.length)) {
      // 无论是监控页面还是非监控页面，都更新分析内容
      analysisContent.value = newAnalysis || ''
      
      // 如果分析内容不为空且正在分析中，检查分析是否完成
      if (isAnalyzing.value && newAnalysis) {
        // 检查是否包含分析完成的标记
        if (newAnalysis.includes('**分析完成**') || newAnalysis.includes('分析完成') || newAnalysis.includes('结论') || newAnalysis.includes('总结')) {
          // 延迟关闭分析状态，让用户看到完成标记
          setTimeout(() => {
            isAnalyzing.value = false
            // 显示分析完成提示
            ElMessage.success('AI分析完成')
          }, 1000)
        }
      }
    }
  }
}, { immediate: true })

// 监听弹窗显示状态，当弹窗显示且没有分析内容时自动触发AI分析
watch(() => showFaultAlert.value && currentFaultAlert.value && !isOnMonitoringPage.value, (shouldAutoAnalyze) => {
  if (shouldAutoAnalyze && !analysisContent.value && !isAnalyzing.value) {
    // 不在监控页面时，通过全局事件通知监控页面进行AI分析
    // 这样可以确保只有一个地方触发AI分析，结果通过monitoringStore共享
    ElMessage.info('正在请求AI分析...')
    triggerAnalysis()
  }
}, { immediate: true })

// 监听全局流式分析事件
const handleFaultAnalysisStreaming = (event: CustomEvent) => {
  if (!showFaultAlert.value || !currentFaultAlert.value) return
  
  const { content, isComplete } = event.detail
  
  // 更新分析内容
  analysisContent.value = content
  
  // 如果正在分析中，检查是否完成
  if (isAnalyzing.value && isComplete) {
    // 检查是否包含分析完成的标记
    if (content.includes('**分析完成**') || content.includes('分析完成') || content.includes('结论') || content.includes('总结')) {
      // 延迟关闭分析状态，让用户看到完成标记
      setTimeout(() => {
        isAnalyzing.value = false
        // 显示分析完成提示
        ElMessage.success('AI分析完成')
      }, 1000)
    } else {
      // 如果没有完成标记，也关闭分析状态
      isAnalyzing.value = false
    }
  }
}

// 组件挂载时添加全局事件监听
onMounted(() => {
  window.addEventListener('fault-analysis-streaming', handleFaultAnalysisStreaming as EventListener)
})

// 组件卸载时移除全局事件监听
onUnmounted(() => {
  window.removeEventListener('fault-analysis-streaming', handleFaultAnalysisStreaming as EventListener)
})

// 格式化时间
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

// 获取班组中文标签
const getShiftLabel = (shiftValue: string) => {
  const shiftMap: Record<string, string> = {
    'jia': '甲班',
    'yi': '乙班',
    'bing': '丙班',
    'A': '甲班',
    'B': '乙班',
    'C': '丙班'
  }
  return shiftMap[shiftValue] || shiftValue
}

// 关闭警告
const closeAlert = () => {
  monitoringStore.closeCurrentFaultAlert()
}

// 跳转到监控页面
const goToMonitoring = () => {
  closeAlert()
  router.push('/monitoring')
}

// 触发AI分析
const triggerAnalysis = async () => {
  if (!currentFaultAlert.value) return
  
  isAnalyzing.value = true
  analysisContent.value = '' // 清空之前的分析结果
  
  try {
    // 无论是监控页面还是非监控页面，都通过事件通知监控页面进行AI分析
    // 这样可以确保只有一个地方触发AI分析，结果通过monitoringStore共享
    window.dispatchEvent(new CustomEvent('trigger-fault-analysis', {
      detail: {
        faultId: currentFaultAlert.value.id
      }
    }))
    
    // 设置一个超时，防止分析状态一直不结束
    setTimeout(() => {
      if (isAnalyzing.value) {
        isAnalyzing.value = false
      }
    }, 60000) // 60秒超时
  } catch (error) {
    console.error('触发AI分析失败:', error)
    isAnalyzing.value = false
  }
}
</script>

<style scoped>
/* 故障警告遮罩 */
.fault-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* 故障警告卡片 */
.fault-alert-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  border: 2px solid #e53935;
  animation: fault-pulse 2s infinite;
}

@keyframes fault-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(229, 57, 53, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(229, 57, 53, 0);
  }
}

/* 故障警告头部 */
.fault-alert-header {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ef9a9a;
}

.fault-alert-icon {
  color: #d32f2f;
  margin-right: 16px;
  animation: fault-shake 1s infinite;
}

@keyframes fault-shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.fault-alert-title {
  flex: 1;
}

.fault-alert-title h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 700;
  color: #b71c1c;
}

.fault-name {
  font-size: 16px;
  font-weight: 600;
  color: #d32f2f;
}

.fault-alert-time {
  font-size: 14px;
  color: #757575;
  margin-right: 16px;
}

.fault-alert-close {
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.fault-alert-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #d32f2f;
}

/* 设备信息 */
.fault-alert-device {
  padding: 16px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #eeeeee;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-type, .device-number, .device-shift {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.device-type {
  background-color: #e3f2fd;
  color: #1565c0;
}

.device-number {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.device-shift {
  background-color: #fff3e0;
  color: #e65100;
}

/* AI分析部分 */
.fault-alert-content {
  padding: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.ai-analysis-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #424242;
}

.ai-analysis-content {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  min-height: 100px;
}

.analysis-text {
  /* 移除冗余样式，让MarkdownRenderer组件完全控制样式 */
}

.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #757575;
}

.analysis-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #757575;
  text-align: center;
}

.analysis-prompt p {
  margin-bottom: 16px;
  font-size: 14px;
}

.loading-dots {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #d32f2f;
  animation: loading-dot 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-dot {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 流式指示器 */
.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 8px 0;
}

.streaming-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #d32f2f;
  animation: streaming-pulse 1.4s infinite ease-in-out both;
}

.streaming-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.streaming-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes streaming-pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 底部按钮 */
.fault-alert-footer {
  padding: 16px 20px;
  background-color: #fafafa;
  border-top: 1px solid #eeeeee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 过渡动画 */
.fault-alert-enter-active, .fault-alert-leave-active {
  transition: all 0.3s ease;
}

.fault-alert-enter-from, .fault-alert-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>