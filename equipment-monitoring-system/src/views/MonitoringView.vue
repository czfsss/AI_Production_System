<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import * as echarts from 'echarts'
import { useAuthStore } from '../stores/auth'

type ShiftType = '甲班' | '乙班' | '丙班'
type DeviceType = 'cigarette_machine' | 'packing_machine' | 'cartoning_machine'
type ShiftValue = 'jia' | 'yi' | 'bing'
type AlarmLevel = 'emergency' | 'important' | 'normal'
type AlarmStatus = 'processed' | 'pending'

interface MockDataItem {
  date: string
  甲班?: number
  乙班?: number
  丙班?: number
  [key: string]: any
}

interface DeviceOption {
  label: string
  value: string | number
}

interface AlarmRecord {
  id: number
  mch_name: string
  fault_time: string
  stop_time: string
  fault_name: string
  mch_params: Record<string, any>
  ai_analysis: string
  class_group: string
  class_shift: string
}

interface ChartFilters {
  dateRange: [Date, Date]
  shift: string
}

interface HistoryFilters {
  dateRange: [Date, Date] | null
  class_group: string
  mch_name: string
}

interface ChartDataItem {
  name: string
  value: number
}

interface PieDataItem {
  value: number
  name: string
}

const authStore = useAuthStore()

// 登录提示弹窗控制
const showLoginPrompt = ref(false)

// 登录验证函数
const requireAuth = (callback: () => void) => {
  if (!authStore.isLoggedIn) {
    showLoginPrompt.value = true
    return
  }
  callback()
}

// 打开登录弹窗的函数
const openLoginDialog = () => {
  showLoginPrompt.value = false
  // 触发LoginButton组件的登录弹窗
  const loginButton = document.querySelector('.btn') as HTMLElement
  if (loginButton) {
    loginButton.click()
  }
}

const md: MarkdownIt = new MarkdownIt({
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
const activeTab = ref('monitoring') // 'monitoring', 'fault-dashboard', 'analysis'

// Fault Dashboard Sub-tabs
const faultDashboardTab = ref('data-dashboard') // 'data-dashboard', 'history-records'

// Device Binding
const deviceType = ref('')
const deviceNumber = ref('')
const shift = ref('')
const isDeviceBound = ref(false)
const deviceTypes: DeviceOption[] = [
  { label: '卷接机', value: 'cigarette_machine' },
  { label: '包装机', value: 'packing_machine' },
  { label: '封箱机', value: 'cartoning_machine' }
]
const deviceNumbers: DeviceOption[] = Array.from({ length: 22 }, (_, i) => ({ label: `${i + 1}#`, value: i + 1 }))
const shifts: DeviceOption[] = [
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
const alarmHistoryRecords = ref<AlarmRecord[]>([
  {
    id: 1,
    mch_name: '包装机-3#',
    fault_time: '2024-01-15 14:20:00',
    stop_time: '45分钟',
    fault_name: '液压系统压力过高',
    mch_params: { pressure: '120MPa', temperature: '25°C' },
    ai_analysis: '液压系统压力过高，建议检查液压泵和压力传感器',
    class_group: '甲班',
    class_shift: '早班'
  },
  {
    id: 2,
    mch_name: '卷接机-15#',
    fault_time: '2024-01-15 10:15:00',
    stop_time: '30分钟',
    fault_name: '烟支供应中断',
    mch_params: { speed: '8000支/分', humidity: '65%' },
    ai_analysis: '烟支供应中断，检查供料系统和传送带',
    class_group: '乙班',
    class_shift: '中班'
  },
  {
    id: 3,
    mch_name: '封箱机-8#',
    fault_time: '2024-01-16 08:30:00',
    stop_time: '60分钟',
    fault_name: '电机过载',
    mch_params: { current: '15A', voltage: '380V' },
    ai_analysis: '电机过载，建议检查负载和电机散热系统',
    class_group: '丙班',
    class_shift: '晚班'
  },
])

// Shift Analysis (for 本班分析 tab)
const isAnalyzingShift = ref(false)
const shiftAnalysisResult = ref('')
const showAnalysisResult = ref(false)

// Fault Dashboard - Charts
const chart1Ref = ref<HTMLElement | null>(null)
const chart2Ref = ref<HTMLElement | null>(null)
const chart3Ref = ref<HTMLElement | null>(null)
let chart1Instance: echarts.ECharts | null = null
let chart2Instance: echarts.ECharts | null = null
let chart3Instance: echarts.ECharts | null = null

// Fault Dashboard - Data
const chartFilters = reactive<ChartFilters>({
  dateRange: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
  shift: ''
})

// History Records Filters
const historyFilters = reactive<HistoryFilters>({
  dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
  class_group: '',
  mch_name: ''
})

const isRefreshing = ref(false)
const refreshInterval = ref<number | null>(null)

// --- Functions ---

// Fault Dashboard Functions
const initCharts = () => {
  if (chart1Ref.value) {
    chart1Instance = echarts.init(chart1Ref.value)
    updateChart1()
  }
  if (chart2Ref.value) {
    chart2Instance = echarts.init(chart2Ref.value)
    updateChart2()
  }
  if (chart3Ref.value) {
    chart3Instance = echarts.init(chart3Ref.value)
    updateChart3()
  }
}

const updateChart1 = () => {
  if (!chart1Instance) return
  
  // 生成模拟数据
  const generateMockData = (): MockDataItem[] => {
    const startDate = new Date(chartFilters.dateRange[0]);
    const endDate = new Date(chartFilters.dateRange[1]);
    const data: MockDataItem[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const item: MockDataItem = { date: dateStr };

      // 如果选择了班组，只生成该班组的数据
      if (chartFilters.shift) {
        item[chartFilters.shift] = Math.floor(Math.random() * 6) + 1;
      } else {
        // 否则生成所有班组的数据
        item['甲班'] = Math.floor(Math.random() * 6) + 1;
        item['乙班'] = Math.floor(Math.random() * 6) + 1;
        item['丙班'] = Math.floor(Math.random() * 6) + 1;
      }

      data.push(item);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const mockData = generateMockData();

  // 确定要显示的班组
  const series: any[] = [];
  const legendData: string[] = [];
  const colors = ['#4285F4', '#34A853', '#FBBC05'];
  const shifts: ShiftType[] = chartFilters.shift ? [chartFilters.shift as ShiftType] : ['甲班', '乙班', '丙班'];

  shifts.forEach((shift, index) => {
    series.push({
      name: shift,
      type: 'bar',
      smooth: true,
      data: mockData.map(item => item[shift] || 0),
      itemStyle: { borderRadius: [4, 4, 0, 0], color: colors[index % colors.length] }
    });
    legendData.push(shift);
  });

  const option = {
    title: { text: '各班组当前设备故障次数统计', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { data: legendData, top: 40 },
    toolbox: {
      feature: {
        magicType: { type: ['line', 'bar'] },
        restore: {},
        saveAsImage: {}
      }
    },
    grid: { top: '25%', right: '3%', left: '3%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: mockData.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '故障次数'
    },
    series: series
  }
  chart1Instance.setOption(option)
}

const updateChart2 = () => {
  if (!chart2Instance) return
  
  const mockData: ChartDataItem[] = [
    { name: '液压系统压力过高', value: 45 },
    { name: '烟支供应中断', value: 30 },
    { name: '电机过载', value: 60 },
    { name: '传感器故障', value: 25 },
    { name: '温度异常', value: 35 },
    { name: '润滑不足', value: 40 }
  ]

  const option = {
    title: { text: '本班故障停机时长统计', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    toolbox: {
      feature: {
        magicType: { type: ['line', 'bar'] },
        restore: {},
        saveAsImage: {}
      }
    },
    grid: { top: '20%', right: '3%', left: '3%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: mockData.map(item => item.name),
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: '停机时长(分钟)'
    },
    series: [{
      type: 'bar',
      smooth: true,
      data: mockData.map(item => item.value),
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#61A5FA' },
          { offset: 1, color: '#316EF8' }
        ])
      }
    }]
  }
  chart2Instance.setOption(option)
}

const updateChart3 = () => {
  if (!chart3Instance) return
  
  const mockData: PieDataItem[] = [
    { value: 15, name: '液压系统压力过高' },
    { value: 12, name: '烟支供应中断' },
    { value: 20, name: '电机过载' },
    { value: 8, name: '传感器故障' },
    { value: 10, name: '温度异常' },
    { value: 5, name: '其他' }
  ]

  const option = {
    title: { text: '故障分类统计', left: 'center', textStyle: { fontSize: 16 } },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      left: 'center'
    },
    grid: { top: '15%', right: '3%', left: '3%', bottom: '15%', containLabel: true },
    series: [{
      name: '故障次数',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: false
      },
      data: mockData,
      color: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#673AB7', '#00BCD4']
    }]
  }
  chart3Instance.setOption(option)
}

const refreshCharts = () => {
  isRefreshing.value = true
  setTimeout(() => {
    updateChart1()
    updateChart2()
    updateChart3()
    isRefreshing.value = false
    ElMessage.success('图表数据已刷新')
  }, 1000)
}

const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  refreshInterval.value = setInterval(() => {
    if (activeTab.value === 'fault-dashboard') {
      refreshCharts()
    }
  }, 3 * 60 * 1000) // 3分钟
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Computed for filtered history records
const filteredHistoryRecords = computed(() => {
  let records = alarmHistoryRecords.value
  
  if (historyFilters.dateRange && historyFilters.dateRange[0]) {
    const startDate = new Date(historyFilters.dateRange[0])
    const endDate = new Date(historyFilters.dateRange[1])
    records = records.filter(record => {
      const recordDate = new Date(record.fault_time)
      return recordDate >= startDate && recordDate <= endDate
    })
  }
  
  if (historyFilters.class_group) {
    records = records.filter(record => record.class_group === historyFilters.class_group)
  }
  
  if (historyFilters.mch_name) {
    records = records.filter(record => 
      record.mch_name.toLowerCase().includes(historyFilters.mch_name.toLowerCase())
    )
  }
  
  return records
})

const bindDevice = () => {
  requireAuth(() => {
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
  })
}

const unbindDevice = () => {
  requireAuth(() => {
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



const simulateDeviceFault = () => {
  requireAuth(() => {
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
  })
}

const analyzeFault = async () => {
  requireAuth(async () => {
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
  })
}

const performShiftAnalysis = async () => {
  requireAuth(async () => {
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
  })
}

const closeShiftAnalysisResult = () => {
  showAnalysisResult.value = false
  shiftAnalysisResult.value = ''
  isAnalyzingShift.value = false
}

// 监听登录状态变化，显示登录成功提示
watch(() => authStore.isLoggedIn, (newValue, oldValue) => {
  if (newValue === true && oldValue === false) {
    ElMessage.success('登录成功！欢迎使用设备监控系统')
  }
}, { immediate: false })

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

watch(activeTab, (newTab) => {
  if (newTab === 'fault-dashboard') {
    setTimeout(() => {
      initCharts()
      startAutoRefresh()
    }, 100)
  } else {
    stopAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
  if (chart1Instance) chart1Instance.dispose()
  if (chart2Instance) chart2Instance.dispose()
  if (chart3Instance) chart3Instance.dispose()
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
        :class="['tab-button', { active: activeTab === 'fault-dashboard' }]"
        @click="activeTab = 'fault-dashboard'"
      >
        故障看板
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

      <!-- 故障看板 -->
      <div v-if="activeTab === 'fault-dashboard'" class="fault-dashboard">
        <div class="card">
          <!-- 内部标签页 -->
          <el-tabs v-model="faultDashboardTab" class="fault-dashboard-tabs">
            <el-tab-pane label="数据看板" name="data-dashboard">
              <div class="header-actions">
                <div class="filters-container">
                  <el-date-picker
                    v-model="chartFilters.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 220px; margin-right: 10px;"
                    @change="refreshCharts"
                  />
                  <el-select v-model="chartFilters.shift" placeholder="选择班组" clearable style="width: 120px; margin-right: 10px;" @change="refreshCharts">
                    <el-option label="甲班" value="甲班" />
                    <el-option label="乙班" value="乙班" />
                    <el-option label="丙班" value="丙班" />
                  </el-select>
                </div>
                <el-button 
                  type="primary" 
                  @click="refreshCharts" 
                  :loading="isRefreshing"
                  icon="Refresh"
                >
                  刷新数据
                </el-button>
              </div>
              <div class="charts-container">
                <div class="chart-row">
                  <div class="chart-item">
                    <div ref="chart1Ref" class="chart"></div>
                  </div>
                  <div class="chart-item">
                    <div ref="chart2Ref" class="chart"></div>
                  </div>
                </div>
                <div class="chart-row">
                  <div class="chart-item full-width">
                    <div ref="chart3Ref" class="chart"></div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="历史故障记录" name="history-records">
              <div class="history-records">
                <div class="filters">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-date-picker
                        v-model="historyFilters.dateRange"
                        type="daterange"
                        range-separator="至"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        style="width: 100%"
                      />
                    </el-col>
                    <el-col :span="6">
                      <el-select v-model="historyFilters.class_group" placeholder="选择班组" clearable>
                        <el-option label="甲班" value="甲班" />
                        <el-option label="乙班" value="乙班" />
                        <el-option label="丙班" value="丙班" />
                      </el-select>
                    </el-col>
                    <el-col :span="6">
                      <el-input
                        v-model="historyFilters.mch_name"
                        placeholder="设备名称"
                        clearable
                      />
                    </el-col>
                    <el-col :span="4">
                      <el-button type="primary" @click="() => {}" icon="Search">查询</el-button>
                    </el-col>
                  </el-row>
                </div>
                
                <el-table :data="filteredHistoryRecords" style="width: 100%" stripe>
                  <el-table-column prop="mch_name" label="设备名称" width="150" />
                  <el-table-column prop="fault_time" label="故障时间" width="180" />
                  <el-table-column prop="class_group" label="班组" width="80" />
                  <el-table-column prop="fault_name" label="故障名称" width="150" />
                  <el-table-column prop="mch_params" label="设备参数" width="200" />
                  <el-table-column prop="ai_analysis" label="AI分析" />
                  <el-table-column prop="class_shift" label="班次" width="80" />
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 本班分析 -->
      <div v-if="activeTab === 'analysis'" class="analysis-tab">
        <div v-if="!showAnalysisResult" class="shift-analysis-prompt">
          <div v-if="isAnalyzingShift" class="analysis-loading-container">
            <div class="container">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="loading-text enhanced">
              <span class="jump-letter">努</span>
              <span class="jump-letter">力</span>
              <span class="jump-letter">分</span>
              <span class="jump-letter">析</span>
              <span class="jump-letter">中</span>
            </div>
          </div>
          <button 
            v-if="!isAnalyzingShift"
            class="analyze-button"
            @click="performShiftAnalysis"
          >
            开始分析
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
    
    <!-- 登录提示弹窗 -->
    <div v-if="showLoginPrompt" class="custom-dialog-overlay">
      <div class="login-prompt-container">
        <div class="login-prompt-header">
          <div class="svg-wrapper-1">
            <div class="svg-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="login-prompt-content">
          <h3>请先登录，再使用哦</h3>
          <p>登录后即可使用设备监控、故障分析等全部功能</p>
        </div>
        <div class="login-prompt-footer">
          <button @click="openLoginDialog">
            <div class="svg-wrapper-1">
              <div class="svg-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                </svg>
              </div>
            </div>
            <span>去登陆</span>
          </button>
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
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  height: 96px;
  width: 96px;
  animation: rotate_3922 1.2s linear infinite;
  background-color: #9b59b6;
  background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
}

.container span {
  position: absolute;
  border-radius: 50%;
  height: 100%;
  width: 100%;
  background-color: #9b59b6;
  background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
}

.container span:nth-of-type(1) {
  filter: blur(5px);
}

.container span:nth-of-type(2) {
  filter: blur(10px);
}

.container span:nth-of-type(3) {
  filter: blur(25px);
}

.container span:nth-of-type(4) {
  filter: blur(50px);
}

.container::after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  background-color: #fff;
  border: solid 5px #ffffff;
  border-radius: 50%;
}

@keyframes rotate_3922 {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
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
  width: 100%;
  min-height: 670px;
}

.filters-container {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.tab-navigation {
  display: flex;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .tab-button,
  .bind-button,
  .analyze-button,
  .el-button {
    min-height: 44px;
    min-width: 44px;
  }

  .status-indicator {
    padding: 12px 20px;
  }

  .param-item {
    padding: 12px;
  }

  .el-select .el-input__wrapper,
  .el-date-picker .el-input__wrapper {
    min-height: 44px;
  }
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
  min-height: 670px;
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

.loading-text {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
  font-weight: 500;
}
.shift-analysis-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 75vh; /* 使用视口高度单位 */
  padding: 5vh 0; /* 视口百分比留白 */
  flex-direction: column;
  gap: 40px;
  margin: 0 auto;
  width: 100%;
}

.analysis-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
}

.loading-text.enhanced {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #87CEEB;
  margin-top: 20px;
  margin-bottom: 0;
}

.jump-letter {
  display: inline-block;
  animation: jump 1s ease-in-out infinite;
}

.jump-letter:nth-child(1) { animation-delay: 0s; }
.jump-letter:nth-child(2) { animation-delay: 0.1s; }
.jump-letter:nth-child(3) { animation-delay: 0.2s; }
.jump-letter:nth-child(4) { animation-delay: 0.3s; }
.jump-letter:nth-child(5) { animation-delay: 0.4s; }

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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

/* 登录提示弹窗样式 */
.login-prompt-container {
  max-width: 320px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
  padding: 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.login-prompt-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, #4e75ff, #3d5afe, #4e75ff);
  background-size: 200% 100%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-prompt-header {
  margin-bottom: 25px;
}

.svg-wrapper-1 {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.svg-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  background: rgba(78, 117, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-wrapper svg {
  width: 30px;
  height: 30px;
  fill: #4e75ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.login-prompt-content h3 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 10px 0;
}

.login-prompt-content p {
  color: #718096;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.login-prompt-footer {
  margin-top: 25px;
}

.login-prompt-footer button {
  background: linear-gradient(135deg, #4e75ff 0%, #3d5afe 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(78, 117, 255, 0.3);
}

.login-prompt-footer button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 117, 255, 0.4);
}

.login-prompt-footer button:active {
  transform: translateY(0);
}

.login-prompt-footer button .svg-wrapper-1 {
  margin: 0;
}

.login-prompt-footer button .svg-wrapper {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
}

.login-prompt-footer button .svg-wrapper svg {
  width: 12px;
  height: 12px;
  fill: white;
  animation: none;
}
/* 故障看板样式 */
  .fault-dashboard {
    padding: 20px;
  }

  .fault-dashboard .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
    align-items: center;
  }

  .fault-dashboard-tabs {
    margin-top: 20px;
  }

  .fault-dashboard-tabs :deep(.el-tabs__nav-wrap) {
    display: flex;
    justify-content: center;
  }

  .fault-dashboard-tabs :deep(.el-tabs__nav-scroll) {
    display: flex;
    justify-content: center;
  }

  .fault-dashboard-tabs :deep(.el-tabs__nav) {
    display: flex;
    justify-content: center;
  }

  .charts-container {
    padding: 20px;
  }

  .chart-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .chart-item {
    flex: 1;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
  }

  .chart-item.full-width {
    flex: 1 1 100%;
  }

  .chart {
    width: 100%;
    height: 300px;
  }

  .history-records {
    padding: 20px;
  }

  .filters {
    margin-bottom: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    /* 主要布局 */
    .monitoring-view {
      padding: 10px;
      min-height: auto;
    }

    /* 标签页导航 */
    .tab-navigation {
      flex-direction: column;
      gap: 5px;
    }

    .tab-button {
      padding: 12px 15px;
      font-size: 14px;
    }

    .tab-content {
      padding: 15px;
      min-height: auto;
    }

    /* 监控布局 */
    .monitoring-layout {
      flex-direction: column;
      gap: 15px;
    }

    .left-column, .right-column {
      flex: none;
    }

    /* 设备状态卡片 */
    .status-display h3 {
      font-size: 16px;
    }

    .status-indicator {
      padding: 10px 16px;
      font-size: 14px;
    }

    /* 设备参数网格 */
    .params-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    /* 故障看板 */
    .fault-dashboard {
      padding: 10px;
    }

    .header-actions {
      flex-direction: column;
      gap: 15px;
      padding: 15px;
    }

    .filters-container {
      flex-direction: column;
      margin-right: 0;
      gap: 10px;
    }

    .filters-container .el-date-picker,
    .filters-container .el-select {
      width: 100% !important;
      margin-right: 0 !important;
    }

    /* 图表容器 */
    .chart-row {
      flex-direction: column;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .chart-item {
      margin-bottom: 15px;
      padding: 10px;
    }

    .chart {
      height: 250px;
    }

    .charts-container {
      padding: 15px;
    }

    /* 历史记录表格 */
    .history-records {
      padding: 15px;
    }

    .filters {
      padding: 15px;
      margin-bottom: 15px;
    }

    .filters .el-col {
      margin-bottom: 15px;
    }

    .filters .el-col:last-child {
      margin-bottom: 0;
    }

    /* 表格响应式 */
    .el-table {
      font-size: 12px;
    }

    .el-table .cell {
      padding: 8px 4px;
    }

    /* 设备绑定表单 */
    .device-binding-form h2 {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .enhanced-select :deep(.el-input__wrapper) {
      height: 40px;
      padding: 4px 12px;
    }

    .bind-button {
      height: 44px;
      font-size: 14px;
    }

    /* 分析按钮 */
    .analyze-button {
      padding: 14px 40px;
      font-size: 16px;
    }

    /* 登录提示弹窗 */
    .login-prompt-container {
      margin: 20px;
      max-width: calc(100vw - 40px);
    }

    /* 卡片头部 */
    .card-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .card-header h2 {
      font-size: 18px;
    }
  }

  /* 平板设备适配 */
  @media (min-width: 769px) and (max-width: 1024px) {
    .monitoring-view {
      padding: 15px;
    }

    .monitoring-layout {
      gap: 15px;
    }

    .params-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .header-actions {
      flex-wrap: wrap;
      gap: 15px;
    }

    .filters-container {
      flex-wrap: wrap;
    }

    .chart {
      height: 280px;
    }
  }

  /* 小屏幕手机适配 */
  @media (max-width: 480px) {
    .monitoring-view {
      padding: 8px;
    }

    .tab-button {
      padding: 10px 12px;
      font-size: 13px;
    }

    .tab-content {
      padding: 12px;
    }

    .status-display h3 {
      font-size: 14px;
    }

    .status-indicator {
      padding: 8px 12px;
      font-size: 12px;
    }

    .chart {
      height: 200px;
    }

    .history-records {
      padding: 12px;
    }

    .filters {
      padding: 12px;
    }

    .el-table {
      font-size: 11px;
    }

    .device-binding-form h2 {
      font-size: 18px;
    }

    .analyze-button {
      padding: 12px 30px;
      font-size: 14px;
    }
  }

  /* 横屏模式适配 */
  @media (max-width: 768px) and (orientation: landscape) {
    .tab-navigation {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .tab-button {
      flex: 1;
      min-width: 100px;
    }

    .chart {
      height: 200px;
    }
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

/* 登录提示弹窗遮罩层样式 */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.login-prompt-container {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    transform: translateY(30px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}
</style>