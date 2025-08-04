<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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

// 设备数据
const devices = ref([
  {
    id: 'DEV001',
    name: '生产线A-主电机',
    status: 'running',
    temperature: 65.2,
    pressure: 2.1,
    speed: 1200,
    runtime: '24h 15m',
    lastUpdate: '2024-01-15 15:30:00'
  },
  {
    id: 'DEV002', 
    name: '生产线B-传送带',
    status: 'stopped',
    temperature: 28.5,
    pressure: 0.8,
    speed: 0,
    runtime: '0h 0m',
    lastUpdate: '2024-01-15 15:25:00'
  },
  {
    id: 'DEV003',
    name: '包装机-液压系统',
    status: 'fault',
    temperature: 85.7,
    pressure: 3.5,
    speed: 800,
    runtime: '18h 42m',
    lastUpdate: '2024-01-15 15:28:00'
  }
])

// 报警记录数据
const alarmRecords = ref([
  {
    id: 'ALM001',
    deviceId: 'DEV003',
    deviceName: '包装机-液压系统',
    alarmTime: '2024-01-15 15:28:00',
    level: 'emergency',
    content: '液压系统压力过高，超过安全阈值',
    status: 'unprocessed',
    handler: '',
    handleTime: ''
  },
  {
    id: 'ALM002',
    deviceId: 'DEV002',
    deviceName: '生产线B-传送带',
    alarmTime: '2024-01-15 15:25:00',
    level: 'important',
    content: '传送带停止运行，需要检查',
    status: 'processing',
    handler: '张工',
    handleTime: '2024-01-15 15:30:00'
  },
  {
    id: 'ALM003',
    deviceId: 'DEV001',
    deviceName: '生产线A-主电机',
    alarmTime: '2024-01-15 14:50:00',
    level: 'normal',
    content: '电机温度略高，建议关注',
    status: 'processed',
    handler: '李工',
    handleTime: '2024-01-15 15:00:00'
  }
])

// 筛选条件
const filters = reactive({
  device: '',
  level: '',
  status: '',
  dateRange: []
})

// 故障分析结果
const faultAnalysis = ref('')
const selectedDevice = ref(null)
const analysisLoading = ref(false)

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停机',
    fault: '故障'
  }
  return statusMap[status] || status
}

// 获取状态样式
const getStatusClass = (status: string) => {
  return `status-${status}`
}

// 获取报警级别文本
const getAlarmLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    emergency: '紧急',
    important: '重要',
    normal: '一般'
  }
  return levelMap[level] || level
}

// 获取报警级别样式
const getAlarmLevelClass = (level: string) => {
  return `status-${level}`
}

// 获取处理状态文本
const getProcessStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    unprocessed: '未处理',
    processing: '处理中',
    processed: '已处理'
  }
  return statusMap[status] || status
}

// 筛选后的报警记录
const filteredAlarms = computed(() => {
  return alarmRecords.value.filter(alarm => {
    return (!filters.device || alarm.deviceName.includes(filters.device)) &&
           (!filters.level || alarm.level === filters.level) &&
           (!filters.status || alarm.status === filters.status)
  })
})

// 分析故障
const analyzeFault = async (device: any) => {
  if (!device || device.status !== 'fault') {
    ElMessage.warning('请选择故障设备')
    return
  }

  selectedDevice.value = device
  analysisLoading.value = true
  
  try {
    // 模拟调用Dify API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult = `
## 故障分析报告

### 设备信息
- **设备ID**: ${device.id}
- **设备名称**: ${device.name}
- **故障时间**: ${device.lastUpdate}

### 可能原因分析

| 原因 | 概率 | 详细说明 |
|------|------|----------|
| 液压油污染 | 45% | 液压油中含有杂质，导致阀门堵塞 |
| 油泵磨损 | 30% | 油泵长期使用导致内部零件磨损 |
| 压力传感器故障 | 15% | 传感器读数不准确，误报压力过高 |
| 系统泄漏 | 10% | 管路连接处存在泄漏 |

### 维修建议

#### 立即处理措施
1. **停机检查**：立即停止设备运行，切断电源
2. **压力释放**：缓慢释放系统压力，确保安全
3. **检查油位**：检查液压油位和油质

#### 详细维修步骤
1. **更换液压油**
   - 排放旧液压油
   - 清洁油箱和管路
   - 加注新液压油至标准位

2. **检查油泵**
   - 拆卸油泵进行检查
   - 测量零件磨损程度
   - 更换磨损零件

3. **校准传感器**
   - 检查压力传感器连接
   - 使用标准压力源进行校准
   - 更换故障传感器

#### 所需工具和备件
- **工具**：压力表、扳手套装、油桶、滤油器
- **备件**：液压油(20L)、油泵密封件、压力传感器

#### 预防措施
1. 定期更换液压油（建议每3个月）
2. 每周检查油位和油质
3. 定期校准压力传感器
4. 建立设备维护档案
`
    
    faultAnalysis.value = mockResult
    ElMessage.success('故障分析完成')
  } catch (error) {
    ElMessage.error('故障分析失败')
  } finally {
    analysisLoading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据已刷新')
  // 这里可以添加实际的数据刷新逻辑
}

onMounted(() => {
  // 初始化数据
  refreshData()
})
</script>

<template>
  <div class="monitoring-view">
    <!-- 设备状态概览 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">设备状态监控</h2>
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
      
      <div class="device-grid">
        <div 
          v-for="device in devices" 
          :key="device.id"
          :class="['device-card', device.status]"
          @click="analyzeFault(device)"
        >
          <div class="device-header">
            <span class="device-name">{{ device.name }}</span>
            <span :class="['status', getStatusClass(device.status)]">
              <el-icon v-if="device.status === 'running'"><VideoPlay /></el-icon>
              <el-icon v-else-if="device.status === 'stopped'"><VideoPause /></el-icon>
              <el-icon v-else><Warning /></el-icon>
              {{ getStatusText(device.status) }}
            </span>
          </div>
          
          <div class="device-params">
            <div class="param-item">
              <span>温度</span>
              <span>{{ device.temperature }}°C</span>
            </div>
            <div class="param-item">
              <span>压力</span>
              <span>{{ device.pressure }} MPa</span>
            </div>
            <div class="param-item">
              <span>转速</span>
              <span>{{ device.speed }} rpm</span>
            </div>
            <div class="param-item">
              <span>运行时间</span>
              <span>{{ device.runtime }}</span>
            </div>
          </div>
          
          <div style="margin-top: 12px; font-size: 12px; color: #9ca3af;">
            最后更新: {{ device.lastUpdate }}
          </div>
        </div>
      </div>
    </div>

    <!-- 今日报警记录 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">今日报警记录</h2>
        <el-button type="success" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 筛选器 -->
      <div class="filter-section">
        <div class="filter-item">
          <label>设备筛选</label>
          <el-input v-model="filters.device" placeholder="输入设备名称" clearable />
        </div>
        <div class="filter-item">
          <label>报警级别</label>
          <el-select v-model="filters.level" placeholder="选择级别" clearable>
            <el-option label="紧急" value="emergency" />
            <el-option label="重要" value="important" />
            <el-option label="一般" value="normal" />
          </el-select>
        </div>
        <div class="filter-item">
          <label>处理状态</label>
          <el-select v-model="filters.status" placeholder="选择状态" clearable>
            <el-option label="未处理" value="unprocessed" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="processed" />
          </el-select>
        </div>
      </div>

      <!-- 报警记录表格 -->
      <el-table :data="filteredAlarms" style="width: 100%">
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column prop="alarmTime" label="报警时间" width="180" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="scope">
            <span :class="['status', getAlarmLevelClass(scope.row.level)]">
              {{ getAlarmLevelText(scope.row.level) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="报警内容" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="scope">
            <span :class="['status', getProcessStatusText(scope.row.status) === '未处理' ? 'status-emergency' : 
                           getProcessStatusText(scope.row.status) === '处理中' ? 'status-important' : 'status-normal']">
              {{ getProcessStatusText(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="100" />
        <el-table-column prop="handleTime" label="处理时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" @click="analyzeFault(devices.find(d => d.id === scope.row.deviceId))">
              分析
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 故障分析结果 -->
    <div v-if="faultAnalysis" class="card">
      <div class="card-header">
        <h2 class="card-title">故障分析结果</h2>
        <el-button @click="faultAnalysis = ''">关闭</el-button>
      </div>
      
      <div v-loading="analysisLoading" class="markdown-content" v-html="md.render(faultAnalysis)"></div>
    </div>
  </div>
</template>

<style scoped>
.monitoring-view {
  width: 100%;
}

.device-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.markdown-content {
  line-height: 1.6;
}

:deep(.markdown-content table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.markdown-content th),
:deep(.markdown-content td) {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.markdown-content th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

:deep(.markdown-content tr:nth-child(even)) {
  background-color: #f9fafb;
}

:deep(.markdown-content tr:hover) {
  background-color: #f3f4f6;
}
</style>
