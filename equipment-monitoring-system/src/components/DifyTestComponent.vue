<template>
  <div class="dify-test">
    <h3>Dify API 测试组件</h3>
    
    <el-form label-width="120px" style="max-width: 500px;">
      <el-form-item label="故障名称">
        <el-input v-model="testFaultName" placeholder="请输入故障名称" />
      </el-form-item>
      
      <el-form-item label="机台名称">
        <el-input v-model="testMachineName" placeholder="请输入机台名称" />
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          @click="testDifyAPI" 
          :loading="isLoading"
          :disabled="!testFaultName || !testMachineName"
        >
          测试 Dify 分析
        </el-button>
        <el-button @click="clearResult">清除结果</el-button>
      </el-form-item>
    </el-form>

    <div v-if="analysisResult" class="result-container">
      <h4>分析结果：</h4>
      <div class="markdown-content" v-html="md.render(analysisResult)"></div>
    </div>

    <div v-if="errorMessage" class="error-container">
      <h4>错误信息：</h4>
      <p class="error-text">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { requestDifyAnalysis, type DifyAnalysisRequest } from '../services/difyAnalysis'

// Markdown配置
const md = new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch {}
    }
    return '<pre class="hljs"><code>' + MarkdownIt.prototype.utils.escapeHtml(str) + '</code></pre>'
  }
})

const testFaultName = ref('SE跑条')
const testMachineName = ref('卷接机-1号机台')
const analysisResult = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const testDifyAPI = async () => {
  if (!testFaultName.value || !testMachineName.value) {
    ElMessage.warning('请填写完整信息')
    return
  }

  isLoading.value = true
  analysisResult.value = ''
  errorMessage.value = ''

  const request: DifyAnalysisRequest = {
    faultName: testFaultName.value,
    machineName: testMachineName.value
  }

  try {
    await requestDifyAnalysis(
      request,
      (response) => {
        // 流式接收内容
        analysisResult.value += response.content
      },
      () => {
        // 完成
        ElMessage.success('分析完成')
        isLoading.value = false
      },
      (error) => {
        // 错误
        errorMessage.value = error
        ElMessage.error(`分析失败: ${error}`)
        isLoading.value = false
      }
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '未知错误'
    ElMessage.error('请求失败')
    isLoading.value = false
  }
}

const clearResult = () => {
  analysisResult.value = ''
  errorMessage.value = ''
}
</script>

<style scoped>
.dify-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.result-container {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #f8f9fa;
}

.error-container {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #f56c6c;
  border-radius: 8px;
  background: #fef0f0;
}

.error-text {
  color: #f56c6c;
  margin: 0;
}

.markdown-content {
  line-height: 1.6;
  color: #333;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: #409eff;
  margin-top: 20px;
  margin-bottom: 10px;
}

.markdown-content :deep(p) {
  margin-bottom: 10px;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 10px 0;
  padding-left: 20px;
}

.markdown-content :deep(code) {
  background: #f1f2f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 13px;
}

.markdown-content :deep(pre) {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}
</style>