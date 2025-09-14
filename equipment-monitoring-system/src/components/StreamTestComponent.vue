<template>
  <div class="stream-test">
    <h2>Dify 流式输出测试</h2>
    
    <el-button type="primary" @click="testStreamingAPI" :loading="isLoading">
      测试流式API
    </el-button>
    <el-button @click="clearOutput">清除输出</el-button>
    
    <div class="status">
      <p><strong>状态:</strong> {{ currentStatus }}</p>
      <p><strong>消息数:</strong> {{ messageCount }}</p>
    </div>
    
    <div class="output">
      <h3>实时输出:</h3>
      <div class="streaming-output">
        <div v-html="md.render(streamOutput)"></div>
        <span v-if="isStreaming" class="cursor">|</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import { requestDifyAnalysis } from '../services/difyAnalysis'

const md = new MarkdownIt({ html: true, breaks: true })

const isLoading = ref(false)
const isStreaming = ref(false)
const streamOutput = ref('')
const messageCount = ref(0)
const currentStatus = ref('等待测试')

const testStreamingAPI = async () => {
  isLoading.value = true
  isStreaming.value = false
  streamOutput.value = ''
  messageCount.value = 0
  currentStatus.value = '正在连接...'
  
  try {
    await requestDifyAnalysis(
      {
        faultName: 'SE跑条',
        machineName: '卷接机-1号机台'
      },
      (response) => {
        if (!isStreaming.value) {
          isStreaming.value = true
          currentStatus.value = '正在接收数据...'
        }
        messageCount.value++
        streamOutput.value += response.content
        console.log(`接收消息 ${messageCount.value}:`, response.content)
      },
      () => {
        isStreaming.value = false
        currentStatus.value = `完成 (${messageCount.value}条消息)`
        ElMessage.success(`测试完成！共${messageCount.value}条消息`)
      },
      (error) => {
        isStreaming.value = false
        currentStatus.value = `错误: ${error}`
        ElMessage.error(`失败: ${error}`)
      }
    )
  } catch (error) {
    currentStatus.value = `异常: ${error}`
    ElMessage.error('测试异常')
  } finally {
    isLoading.value = false
  }
}

const clearOutput = () => {
  streamOutput.value = ''
  messageCount.value = 0
  currentStatus.value = '已清除'
}
</script>

<style scoped>
.stream-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.status {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.output {
  margin: 20px 0;
}

.streaming-output {
  border: 1px solid #ddd;
  padding: 15px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  background: #fafafa;
  border-radius: 8px;
  position: relative;
}

.cursor {
  color: #409eff;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>