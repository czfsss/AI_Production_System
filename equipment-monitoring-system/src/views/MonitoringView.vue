<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const md: any = new MarkdownIt({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + MarkdownIt.prototype.utils.escapeHtml(str) + '</code></pre>'
  }
})

// Tab Management
const activeTab = ref('monitoring') // 'monitoring', 'alarms', 'analysis'

// Device Binding
const deviceType = ref('')
const deviceNumber = ref('')
const shift = ref('')
const isDeviceBound = ref(false)
const deviceTypes = [
  { label: '卷接机', value: 'cigarette_machine' },
  { label: '包装机', value: 'packing_machine' },
  { label: '封箱机', value: 'cartoning_machine' }
]
const deviceNumbers = Array.from({ length: 22 }, (_, i) => ({ label: `${i + 1}#`, value: i + 1 }))
// 更新班次选项为甲班、乙班、丙班
const shifts = [
  { label: '甲班', value: 'jia' },
  { label: '乙班', value: 'yi' },
  { label: '丙班', value: 'bing' }
]

// Device Data
const boundDeviceInfo = ref<any>(null)
const currentDeviceParams = ref<any>(null)
const deviceStatus = ref<'running' | 'stopped' | 'fault'>('stopped')
const faultName = ref('')

// AI Analysis
const faultAnalysis = ref('')
const analysisLoading = ref(false)

// Alarm Records (for 故障记录 tab)
const alarmHistoryRecords = ref([
  {
    id: 'ALM001',
    deviceName: '包装机-3#',
    alarmTime: '2024-01-15 14:20:00',
    level: 'emergency',
    content: '液压系统压力过高',
    status: 'processed',
    handler: '张工',
  },
  {
    id: 'ALM002',
    deviceName: '卷接机-15#',
    alarmTime: '2024-01-15 10:15:00',
    level: 'important',
    content: '烟支供应中断',
    status: 'processed',
    handler: '李工',
  },
])

// Shift Analysis (for 本班分析 tab)
const isAnalyzingShift = ref(false)
const shiftAnalysisResult = ref('')
const showAnalysisResult = ref(false)

// --- Functions ---

const bindDevice = () => {
  if (!deviceType.value || !deviceNumber.value || !shift.value) {
    ElMessage.warning('请填写完整的设备信息')
    return
  }
  const typeLabel = deviceTypes.find(t => t.value === deviceType.value)?.label || ''
  boundDeviceInfo.value = {
    type: typeLabel,
    number: deviceNumber.value,
    shift: shift.value,
    id: `DEV-${deviceType.value}-${deviceNumber.value}`
  }
  // Simulate fetching initial device status and params
  deviceStatus.value = 'running'
  currentDeviceParams.value = {
    temperature: (Math.random() * 30 + 50).toFixed(1),
    pressure: (Math.random() * 2 + 1).toFixed(1),
    speed: Math.floor(Math.random() * 500 + 1000),
    runtime: '0h 5m'
  }
  isDeviceBound.value = true
  ElMessage.success('设备绑定成功')
}

// 添加解绑设备确认弹窗
const unbindDevice = () => {
  ElMessageBox.confirm('确定要解绑当前设备吗？解绑后将停止实时监控。', '解绑确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'unbind-confirm'
  })
  .then(() => {
    isDeviceBound.value = false
    boundDeviceInfo.value = null
    currentDeviceParams.value = null
    deviceStatus.value = 'stopped'
    faultAnalysis.value = ''
    ElMessage.info('设备已解绑')
  })
  .catch(() => {
    ElMessage.info('已取消解绑')
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停机',
    fault: '故障'
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  return `status-${status}`
}

const getAlarmLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    emergency: '紧急',
    important: '重要',
    normal: '一般'
  }
  return levelMap[level] || level
}

const getAlarmLevelClass = (level: string) => {
  return `alarm-level-${level}`
}

// Simulate device status change
const simulateDeviceFault = () => {
  if (deviceStatus.value === 'running') {
    deviceStatus.value = 'fault'
    faultName.value = '传感器通讯中断'
    ElMessage.error(`设备发生故障: ${faultName.value}`)
    // Auto-trigger AI analysis on fault
    analyzeFault()
  } else if (deviceStatus.value === 'fault') {
    deviceStatus.value = 'running'
    faultName.value = ''
    faultAnalysis.value = '' // Clear previous analysis
    ElMessage.success('设备已恢复正常')
  }
}

const analyzeFault = async () => {
  if (deviceStatus.value !== 'fault') {
    ElMessage.warning('当前设备无故障，无需分析')
    return
  }
  analysisLoading.value = true
  faultAnalysis.value = '' // Clear previous result

  try {
    // Simulate AI API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    faultAnalysis.value = `
## 故障分析报告

### 设备信息
- **设备**: ${boundDeviceInfo.value.type}-${boundDeviceInfo.value.number}#
- **故障**: ${faultName.value}
- **班次**: ${boundDeviceInfo.value.shift}

### 可能原因
1. 传感器线路松动或损坏。
2. 通讯接口模块故障。
3. 电磁干扰导致信号中断。

### 建议处理步骤
1. **检查线路**: 检查传感器到控制单元的连接线缆是否牢固。
2. **重启设备**: 尝试重启设备控制系统，看是否能恢复通讯。
3. **更换模块**: 若问题依旧，考虑更换通讯接口模块。

### 预防措施
- 定期检查线路连接情况。
- 加强设备接地，减少电磁干扰。
`
    ElMessage.success('AI分析完成')
  } catch (error) {
    ElMessage.error('AI分析失败')
  } finally {
    analysisLoading.value = false
  }
}

const performShiftAnalysis = async () => {
  isAnalyzingShift.value = true
  showAnalysisResult.value = false
  shiftAnalysisResult.value = ''

  try {
    // Simulate AI analysis for the shift
    await new Promise(resolve => setTimeout(resolve, 5000)) // Longer simulation
    shiftAnalysisResult.value = `
## 本班次生产分析报告

### 班次概览
- **班次**: ${boundDeviceInfo.value?.shift || 'N/A'}
- **分析时间**: ${new Date().toLocaleString()}

### 运行总结
本班次设备整体运行平稳，共发生一次 minor 故障，已快速处理，未对生产造成重大影响。设备平均运行参数在正常范围内。

### 关键指标
- **总运行时间**: 7h 45m
- **平均温度**: 62.5°C
- **平均压力**: 1.8 MPa
- **平均转速**: 1180 rpm
- **故障次数**: 1次 (传感器通讯中断)

### 故障分析
本次发生的"传感器通讯中断"故障，原因为线路瞬时接触不良。建议在后续维护中重点关注此类连接点的稳定性。

### 优化建议
1. **预防性维护**: 建议增加对关键传感器连接点的检查频率。
2. **操作培训**: 加强操作人员对设备初期故障现象的识别能力。
3. **备件管理**: 确保常用传感器和通讯模块有充足备件。
`
    ElMessage.success('本班分析完成')
  } catch (error) {
    ElMessage.error('本班分析失败')
  } finally {
    isAnalyzingShift.value = false
    showAnalysisResult.value = true
  }
}

const closeShiftAnalysisResult = () => {
  showAnalysisResult.value = false
  shiftAnalysisResult.value = ''
}

// Simulate real-time data updates
onMounted(() => {
  if (isDeviceBound.value && deviceStatus.value === 'running') {
    const interval = setInterval(() => {
      if (currentDeviceParams.value) {
        currentDeviceParams.value.temperature = (Math.random() * 5 + 60).toFixed(1)
        currentDeviceParams.value.pressure = (Math.random() * 0.5 + 1.5).toFixed(1)
        currentDeviceParams.value.speed = Math.floor(Math.random() * 100 + 1150)
      }
    }, 5000)
    return () => clearInterval(interval)
  }
})
</script>

<template>
  <div class="monitoring-view">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        :class="['tab-button', { active: activeTab === 'monitoring' }]"
        @click="activeTab = 'monitoring'"
      >
        设备状态监控
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'alarms' }]"
        @click="activeTab = 'alarms'"
      >
        报警记录
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'analysis' }]"
        @click="activeTab = 'analysis'"
      >
        本班分析
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- 设备状态监控 -->
      <div v-if="activeTab === 'monitoring'" class="monitoring-tab">
        <div v-if="!isDeviceBound" class="device-binding-form card">
          <h2>绑定监控设备</h2>
          <el-form label-width="100px">
            <el-form-item label="设备型号">
              <el-select v-model="deviceType" placeholder="请选择设备型号" class="enhanced-select">
                <el-option
                  v-for="type in deviceTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="设备序号">
              <el-select v-model="deviceNumber" placeholder="请选择设备序号" class="enhanced-select">
                <el-option
                  v-for="num in deviceNumbers"
                  :key="num.value"
                  :label="num.label"
                  :value="num.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="当前班次">
              <el-select v-model="shift" placeholder="请选择班次" class="enhanced-select">
                <el-option
                  v-for="s in shifts"
                  :key="s.value"
                  :label="s.label"
                  :value="s.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="bindDevice" class="bind-button">绑定设备</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else class="monitoring-layout">
          <!-- Left Column -->
          <div class="left-column">
            <!-- Current Device Status -->
            <div class="card device-status-card">
              <div class="card-header">
                <h2 class="card-title">当前设备监控状态</h2>
                <el-button type="danger" @click="unbindDevice" size="small">解绑设备</el-button>
              </div>
              <div class="status-display">
                <h3>{{ boundDeviceInfo.type }} - {{ boundDeviceInfo.number }}#</h3>
                <div :class="['status-indicator', deviceStatus]">
                  <el-icon v-if="deviceStatus === 'running'"><VideoPlay /></el-icon>
                  <el-icon v-else-if="deviceStatus === 'stopped'"><VideoPause /></el-icon>
                  <el-icon v-else><Warning /></el-icon>
                  <span>{{ getStatusText(deviceStatus) }}</span>
                  <span v-if="deviceStatus === 'fault'" class="fault-name-emphasis">{{ faultName }}</span>
                </div>
                <p>班次: {{ shifts.find(s => s.value === boundDeviceInfo.shift)?.label }}</p>
                <el-button v-if="deviceStatus === 'running'" @click="simulateDeviceFault" type="warning" size="small">模拟故障</el-button>
                <el-button v-if="deviceStatus === 'fault'" @click="simulateDeviceFault" type="success" size="small">模拟恢复</el-button>
              </div>
            </div>

            <!-- Current Device Parameters -->
            <div class="card device-params-card">
              <div class="card-header">
                <h2 class="card-title">当前设备参数</h2>
              </div>
              <div v-if="currentDeviceParams" class="params-grid">
                <div class="param-item">
                  <span class="param-label">温度</span>
                  <span class="param-value">{{ currentDeviceParams.temperature }}°C</span>
                </div>
                <div class="param-item">
                  <span class="param-label">压力</span>
                  <span class="param-value">{{ currentDeviceParams.pressure }} MPa</span>
                </div>
                <div class="param-item">
                  <span class="param-label">转速</span>
                  <span class="param-value">{{ currentDeviceParams.speed }} rpm</span>
                </div>
                <div class="param-item">
                  <span class="param-label">运行时间</span>
                  <span class="param-value">{{ currentDeviceParams.runtime }}</span>
                </div>
              </div>
              <div v-else class="no-data">
                暂无参数数据
              </div>
            </div>
          </div>

          <!-- Right Column: AI Analysis Panel -->
          <div class="right-column">
            <div class="card ai-analysis-card">
              <div class="card-header">
                <h2 class="card-title">AI 故障分析</h2>
              </div>
              <div v-if="deviceStatus !== 'fault'" class="no-fault-message">
                设备运行正常，无故障信息。
              </div>
              <div v-else-if="analysisLoading" class="analysis-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <p>AI正在分析中，请稍候...</p>
              </div>
              <div v-else-if="faultAnalysis" class="markdown-content" v-html="md.render(faultAnalysis)"></div>
              <div v-else class="prompt-analysis">
                 <p>设备发生故障，点击下方按钮开始AI分析。</p>
                 <el-button type="primary" @click="analyzeFault" :loading="analysisLoading">开始AI分析</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 报警记录 -->
      <div v-if="activeTab === 'alarms'" class="alarms-tab card">
        <div class="card-header">
          <h2 class="card-title">历史报警记录</h2>
        </div>
        <el-table :data="alarmHistoryRecords" style="width: 100%">
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="alarmTime" label="报警时间" width="180" />
          <el-table-column prop="level" label="级别" width="100">
            <template #default="scope">
              <span :class="['alarm-tag', getAlarmLevelClass(scope.row.level)]">
                {{ getAlarmLevelText(scope.row.level) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="报警内容" />
          <el-table-column prop="status" label="处理状态" width="100">
             <template #default="scope">
              <span :class="['status-tag', scope.row.status === 'processed' ? 'status-processed' : 'status-unprocessed']">
                {{ scope.row.status === 'processed' ? '已处理' : '未处理' }}
              </span>
            </template>
          </el-table-column>
           <el-table-column prop="handler" label="处理人" width="100" />
        </el-table>
      </div>

      <!-- 本班分析 -->
      <div v-if="activeTab === 'analysis'" class="analysis-tab">
        <div v-if="!showAnalysisResult" class="shift-analysis-prompt">
          <div v-if="isAnalyzingShift" class="tech-loader">
            <div class="orbit"></div>
            <div class="satellite"></div>
            <div class="satellite"></div>
            <div class="satellite"></div>
            <div class="loading-text">分析中...</div>
          </div>
          <button 
            :class="['analyze-button', { 'is-analyzing': isAnalyzingShift }]"
            @click="performShiftAnalysis"
            :disabled="isAnalyzingShift"
          >
            <span v-if="!isAnalyzingShift">开始分析</span>
          </button>
        </div>
        <div v-if="showAnalysisResult" class="shift-analysis-result card">
          <div class="card-header">
            <h2 class="card-title">本班分析结果</h2>
            <el-button type="danger" @click="closeShiftAnalysisResult" size="small">关闭</el-button>
          </div>
          <div class="markdown-content" v-html="md.render(shiftAnalysisResult)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 表单美化 */
.device-binding-form {
  box-shadow: 0 6px 16px rgba(0, 80, 255, 0.15);
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f5ff 100%);
  border: 1px solid #e0edff;
  position: relative;
  overflow: hidden;
}

.device-binding-form h2 {
  color: #1a2b6d;
  text-align: center;
  margin-bottom: 25px;
  font-weight: 600;
  font-size: 24px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.enhanced-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 6px 15px;
  height: 46px;
}

.enhanced-select :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.bind-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #4e75ff 0%, #3d5afe 100%);
  border: none;
  border-radius: 8px;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.bind-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
}

/* 科技风加载动画 */
.tech-loader {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 25px;
}

.orbit {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(64, 158, 255, 0.6);
  border-radius: 50%;
  animation: orbit-rotate 6s linear infinite;
}

.satellite {
  position: absolute;
  top: 0;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background-color: #409eff;
  box-shadow: 0 0 15px #409eff, 0 0 30px rgba(64, 158, 255, 0.5);
}

.satellite:nth-child(2) {
  animation: satellite-orbit 4s -1s linear infinite;
}

.satellite:nth-child(3) {
  animation: satellite-orbit 5s -2s linear infinite;
}

.satellite:nth-child(4) {
  animation: satellite-orbit 7s -3s linear infinite;
}

@keyframes orbit-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes satellite-orbit {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(60px); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(60px); }
}

.loading-text {
  text-align: center;
  margin-top: 130px;
  font-size: 18px;
  color: #409eff;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
  animation: text-pulse 2s infinite alternate;
}

@keyframes text-pulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

.analyze-button {
  padding: 16px 50px;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #536DFE 0%, #3D5AFE 100%);
  color: white;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 6px 20px rgba(83, 109, 254, 0.5);
  font-weight: 600;
  margin-top: 10px;
  z-index: 1;
}

.analyze-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(83, 109, 254, 0.7);
}

.analyze-button:active {
  transform: translateY(1px);
  box-shadow: 0 4px 15px rgba(83, 109, 254, 0.5);
}

/* 保留原有的基础样式 */
.monitoring-view {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  color: #333;
  background-color: #f4f6f9;
  padding: 20px;
  border-radius: 8px;
}

.tab-navigation {
  display: flex;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background-color: #f0f2f5;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-button:hover {
  background-color: #e6e9ed;
}

.tab-button.active {
  background-color: #fff;
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: bold;
}

.tab-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.monitoring-layout {
  display: flex;
  gap: 20px;
}

.left-column, .right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-status-card, .device-params-card, .ai-analysis-card {
  flex-grow: 1;
}

.status-display {
  text-align: center;
  padding: 20px;
}

.status-display h3 {
  margin-top: 0;
  color: #606266;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0;
  color: white;
}

.status-indicator.running {
  background-color: #67c23a;
}

.status-indicator.stopped {
  background-color: #909399;
}

.status-indicator.fault {
  background-color: #f56c6c;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(245, 108, 108, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0); }
}

.fault-name-emphasis {
  font-weight: bold;
  text-decoration: underline;
  margin-left: 10px;
}

.params-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.param-label {
  color: #606266;
}

.param-value {
  font-weight: bold;
  color: #303133;
}

.no-fault-message, .prompt-analysis {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.prompt-analysis p {
  margin-bottom: 20px;
}

.analysis-loading {
  text-align: center;
  padding: 40px 20px;
  color: #409eff;
}

.analysis-loading .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.markdown-content {
  line-height: 1.8;
  color: #333;
}

.markdown-content :deep(h3), .markdown-content :deep(h2) {
  color: #409eff;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 5px;
  margin-top: 25px;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.markdown-content :deep(th), .markdown-content :deep(td) {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f2f2f2;
  font-weight: bold;
}

.alarms-tab .el-table {
  margin-top: 20px;
}

.alarm-tag {
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}

.alarm-level-emergency {
  background-color: #f56c6c;
}

.alarm-level-important {
  background-color: #e6a23c;
}

.alarm-level-normal {
  background-color: #409eff;
}

.status-tag {
   padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
}
.status-processed {
  background-color: #67c23a;
}
.status-unprocessed {
  background-color: #909399;
}

.shift-analysis-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  flex-direction: column;
}

.analyze-button.is-analyzing {
  pointer-events: none;
  background-color: #a0cfff;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>

<style>
/* 解绑弹窗样式 */
.unbind-confirm {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.unbind-confirm .el-message-box__header {
  background: linear-gradient(to right, #f8f8ff, #f0f5ff);
  padding: 16px 20px;
  border-bottom: 1px solid #eaefff;
}

.unbind-confirm .el-message-box__title {
  color: #f56c6c;
  font-weight: 600;
}

.unbind-confirm .el-message-box__content {
  padding: 25px 30px;
  font-size: 16px;
  color: #555;
}

.unbind-confirm .el-message-box__btns {
  padding: 15px 20px 20px;
  display: flex;
  justify-content: center;
}

.unbind-confirm .el-button {
  padding: 10px 25px;
  border-radius: 6px;
  margin: 0 12px;
  font-weight: 500;
}

.unbind-confirm .el-button--primary {
  background: linear-gradient(to right, #ff6b6b, #f56c6c);
  border: none;
}
</style>
