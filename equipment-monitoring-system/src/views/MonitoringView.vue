<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, Warning, Loading, Clock } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { useAuthStore } from '../stores/auth'

// 导入组合式函数
import { useAuth } from '@/composables/useAuth'
import { useDeviceBinding } from '@/composables/useDeviceBinding'
import { useCharts } from '@/composables/useCharts'
import { useFaultAnalysis } from '@/composables/useFaultAnalysis'
import { useShiftAnalysis } from '@/composables/useShiftAnalysis'
import { useFaultRecords } from '@/composables/useFaultRecords'

// 初始化认证相关功能
const { showLoginPrompt, requireAuth, openLoginDialog } = useAuth()

// 临时声明，用于在设备绑定中传递回调
const analyzeFaultFunction = ref<(() => Promise<void>) | undefined>(undefined)

// 初始化设备绑定相关功能
const {
  deviceType,
  deviceNumber,
  shift,
  isDeviceBound,
  deviceTypes,
  deviceNumbers,
  shifts,
  boundDeviceInfo,
  currentDeviceParams,
  deviceStatus,
  faultName,
  bindDevice,
  unbindDevice,
  getStatusText,
  // 实时监控相关
  isMonitoring,
  currentInterval,
  monitoringStats,
  equipmentName,
  startMonitoring,
  stopMonitoring,
  refreshStatus,
  updateDeviceParams,
  simulateDeviceFault,
} = useDeviceBinding(requireAuth, async () => {
  // 故障检测回调，调用AI分析
  if (analyzeFaultFunction.value) {
    await analyzeFaultFunction.value()
  }
})

// 初始化故障分析相关功能
const { faultAnalysis, analysisLoading, isStreaming, streamingProgress, analyzeFault } =
  useFaultAnalysis(requireAuth, boundDeviceInfo, faultName, deviceStatus)

// 赋值给临时声明的变量
analyzeFaultFunction.value = analyzeFault

// 初始化图表相关功能
const {
  chart1Ref,
  chart2Ref,
  chart3Ref,
  chart4Ref,
  chart5Ref,
  chartFilters,
  isRefreshing,
  initCharts,
  refreshCharts,
  startAutoRefresh,
  stopAutoRefresh,
  forceResizeCharts,
} = useCharts()

// 初始化班次分析相关功能
const {
  isAnalyzingShift,
  shiftAnalysisResult,
  showAnalysisResult,
  performShiftAnalysis,
  closeShiftAnalysisResult,
} = useShiftAnalysis(requireAuth, boundDeviceInfo)

// 初始化故障记录相关功能
const {
  faultDashboardTab,
  historyFilters,
  alarmHistoryRecords,
  isLoadingFaultRecords,
  currentPage,
  pageSize,
  totalRecords,
  showFaultDetailDialog,
  selectedFaultRecord,
  filteredHistoryRecords,
  formatDateTime,
  queryFaultHistory,
  openFaultDetail,
  closeFaultDetail,
} = useFaultRecords(requireAuth)

// Tab Management - 从localStorage恢复状态或使用默认值
const getSavedTab = () => {
  const saved = localStorage.getItem('monitoringActiveTab')
  return saved || 'monitoring'
}

const activeTab = ref(getSavedTab())

// 移动端标签页展开状态
const tabsExpanded = ref(false)

const toggleTabs = () => {
  tabsExpanded.value = !tabsExpanded.value
}

// 监听标签页变化，保存到localStorage
watch(activeTab, (newTab) => {
  localStorage.setItem('monitoringActiveTab', newTab)
})

// 监听故障看板内部标签页变化，也保存到localStorage
watch(faultDashboardTab, (newTab) => {
  if (activeTab.value === 'fault-dashboard') {
    localStorage.setItem('monitoringFaultDashboardTab', newTab)
  }
})

// Markdown配置
const md: MarkdownIt = new MarkdownIt({
  html: true, // 允许HTML标签
  breaks: true, // 自动转换换行
  linkify: true, // 自动识别链接
  typographer: true, // 启用智能引号和符号替换
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch {}
    }
    return '<pre class="hljs"><code>' + MarkdownIt.prototype.utils.escapeHtml(str) + '</code></pre>'
  },
})

// 监听标签页变化，自动加载数据
// 监听标签页变化，自动加载数据
watch([activeTab, faultDashboardTab], ([newActiveTab, newFaultDashboardTab]) => {
  if (newActiveTab === 'fault-dashboard' && newFaultDashboardTab === 'history-records') {
    // 只有当数据为空时才自动加载，避免重复请求
    if (alarmHistoryRecords.value.length === 0) {
      queryFaultHistory()
    }
  }

  // 当切换到数据看板时，延迟初始化和刷新图表
  if (newActiveTab === 'fault-dashboard' && newFaultDashboardTab === 'data-dashboard') {
    // 使用 nextTick 确保 DOM 更新完成后再初始化图表
    nextTick(() => {
      setTimeout(() => {
        initCharts()
        // 再次延迟调整图表大小，确保容器尺寸正确
        setTimeout(() => {
          forceResizeCharts()
        }, 100)
      }, 50)
    })
  }
})

// 监听登录状态变化，显示登录成功提示
const authStore = useAuthStore()
watch(
  () => authStore.isLoggedIn,
  (newValue, oldValue) => {
    if (newValue === true && oldValue === false) {
      ElMessage.success('登录成功！欢迎使用设备监控系统')
    }
  },
  { immediate: false },
)

// 监听标签页变化，管理图表自动刷新
watch(activeTab, (newTab) => {
  if (newTab === 'fault-dashboard') {
    // 使用 nextTick 确保标签页内容已经渲染
    nextTick(() => {
      setTimeout(() => {
        initCharts()
        startAutoRefresh()
        // 额外的延迟调整，解决图表挤压问题
        setTimeout(() => {
          forceResizeCharts()
        }, 200)
      }, 100)
    })
  } else {
    stopAutoRefresh()
  }
})

// 组件挂载时的初始化
onMounted(() => {
  // 恢复故障看板内部标签页状态
  const savedFaultDashboardTab = localStorage.getItem('monitoringFaultDashboardTab')
  if (savedFaultDashboardTab && activeTab.value === 'fault-dashboard') {
    faultDashboardTab.value = savedFaultDashboardTab
  }

  // 如果当前标签页是故障看板，则初始化图表
  if (activeTab.value === 'fault-dashboard') {
    nextTick(() => {
      setTimeout(() => {
        initCharts()
        startAutoRefresh()
        // 确保图表尺寸正确
        setTimeout(() => {
          forceResizeCharts()
        }, 200)
      }, 100)
    })
  }

  // 如果当前标签页是历史故障记录，则自动加载数据
  if (activeTab.value === 'fault-dashboard' && faultDashboardTab.value === 'history-records') {
    queryFaultHistory()
  }

  // 注意：现在使用实时数据监控，不再需要模拟参数更新
  // 设备参数将通过实时监控自动更新
})

// 组件卸载时的清理
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<template>
  <div class="monitoring-view">
    <!-- Tab Navigation -->
    <div class="tab-navigation-container">
      <!-- 移动端展开按钮 -->
      <div class="tabs-expand-button" @click="toggleTabs">
        <el-icon><component :is="tabsExpanded ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
        <span>{{ tabsExpanded ? '收起' : '展开' }}</span>
      </div>

      <div class="tab-navigation" :class="{ expanded: tabsExpanded }">
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
              <el-select
                v-model="deviceNumber"
                placeholder="请选择设备序号"
                class="enhanced-select"
              >
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
                <el-option v-for="s in shifts" :key="s.value" :label="s.label" :value="s.value" />
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
            <div :class="['card', 'device-status-card', `status-${deviceStatus}`]">
              <div class="card-header">
                <h2 class="card-title">当前设备监控状态</h2>
                <div class="header-actions">
                  <el-button
                    v-if="isDeviceBound && !isMonitoring"
                    type="success"
                    @click="startMonitoring"
                    size="small"
                    >开始监控</el-button
                  >
                  <el-button v-if="isMonitoring" type="warning" @click="stopMonitoring" size="small"
                    >停止监控</el-button
                  >
                  <el-button v-if="isMonitoring" type="info" @click="refreshStatus" size="small"
                    >刷新状态</el-button
                  >
                  <el-button type="danger" @click="unbindDevice" size="small">解绑设备</el-button>
                </div>
              </div>
              <div class="enhanced-status-display">
                <div class="device-info">
                  <h3 class="device-name">
                    {{ boundDeviceInfo?.type }} - {{ boundDeviceInfo?.number }}#
                  </h3>
                  <div class="device-details">
                    <div class="shift-info">
                      <el-icon><Clock /></el-icon>
                      <span
                        >班次:
                        {{ shifts.find((s) => s.value === boundDeviceInfo?.shift)?.label }}</span
                      >
                    </div>
                    <div class="equipment-name" v-if="equipmentName">
                      <span>设备编号: {{ equipmentName }}</span>
                    </div>
                  </div>
                </div>

                <div class="status-center">
                  <div :class="['enhanced-status-indicator', deviceStatus]">
                    <div class="status-icon-wrapper">
                      <el-icon v-if="deviceStatus === 'running'" class="status-icon"
                        ><VideoPlay
                      /></el-icon>
                      <el-icon v-else-if="deviceStatus === 'stopped'" class="status-icon"
                        ><VideoPause
                      /></el-icon>
                      <el-icon v-else class="status-icon"><Warning /></el-icon>
                    </div>
                    <div class="status-content">
                      <span class="status-text">{{ getStatusText(deviceStatus) }}</span>
                      <span v-if="deviceStatus === 'fault'" class="fault-name-emphasis">{{
                        faultName
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- 实时监控状态 -->
                <div class="monitoring-status">
                  <div v-if="isMonitoring" class="monitoring-active">
                    <div class="monitoring-indicator">
                      <span class="pulse-dot"></span>
                      <span>实时监控中</span>
                    </div>
                    <div class="monitoring-info">
                      <div class="info-item">
                        <span class="label">检查间隔:</span>
                        <span class="value">{{ currentInterval / 1000 }}秒</span>
                      </div>
                      <div class="info-item" v-if="monitoringStats.lastCheckTime">
                        <span class="label">上次检查:</span>
                        <span class="value">{{ monitoringStats.lastCheckTime }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="monitoring-inactive">
                    <span>未启动实时监控</span>
                  </div>
                </div>

                <!-- 演示功能按钮 -->
                <div class="demo-actions">
                  <div class="demo-section-title">演示功能</div>
                  <div class="demo-buttons">
                    <el-button
                      v-if="deviceStatus === 'running'"
                      @click="simulateDeviceFault()"
                      type="warning"
                      size="default"
                      class="demo-btn"
                    >
                      <el-icon><Warning /></el-icon>
                      模拟故障
                    </el-button>
                    <el-button
                      v-if="deviceStatus === 'fault'"
                      @click="simulateDeviceFault()"
                      type="success"
                      size="default"
                      class="demo-btn"
                    >
                      <el-icon><VideoPlay /></el-icon>
                      模拟恢复
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Current Device Parameters -->
            <div class="card device-params-card">
              <div class="card-header">
                <h2 class="card-title">当前设备参数</h2>
                <div class="header-actions">
                  <el-button v-if="isDeviceBound" type="info" @click="updateDeviceParams" size="small"
                    >刷新参数</el-button
                  >
                </div>
              </div>
              <div v-if="currentDeviceParams" class="params-grid">
                <div class="param-item">
                  <div class="param-label">生产速度（卷接机）</div>
                  <div class="param-value">{{ currentDeviceParams.productionSpeed }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">烟支重量标准偏差（SD）</div>
                  <div class="param-value">{{ currentDeviceParams.weightStandardDeviation }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">压缩空气工作压力</div>
                  <div class="param-value">{{ currentDeviceParams.compressedAirPressure }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">压缩空气流量（卷烟机）</div>
                  <div class="param-value">{{ currentDeviceParams.compressedAirFlowCigarette }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">压缩空气流量（接装机）</div>
                  <div class="param-value">{{ currentDeviceParams.compressedAirFlowAssembly }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">真空系统工作压力</div>
                  <div class="param-value">{{ currentDeviceParams.vacuumSystemPressure }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">除尘系统负压</div>
                  <div class="param-value">{{ currentDeviceParams.dustCollectionPressure }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">空头剔除率</div>
                  <div class="param-value">{{ currentDeviceParams.looseEndRejectRate }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">设备运行效率（OEE）</div>
                  <div class="param-value">{{ currentDeviceParams.oee }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">风室负压（压力传感器）</div>
                  <div class="param-value">{{ currentDeviceParams.airChamberNegativePressure }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">烙铁温度（温度传感器）</div>
                  <div class="param-value">{{ currentDeviceParams.solderingIronTemperature }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">烟支平均重量（称重传感器）</div>
                  <div class="param-value">{{ currentDeviceParams.averageCigaretteWeight }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">刀头振动幅度（振动传感器）</div>
                  <div class="param-value">{{ currentDeviceParams.cutterVibrationAmplitude }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">胶泵压力（压力传感器）</div>
                  <div class="param-value">{{ currentDeviceParams.gluePumpPressure }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">烟支长度（激光传感器）</div>
                  <div class="param-value">{{ currentDeviceParams.cigaretteLength }}</div>
                </div>
                <div class="param-item">
                  <div class="param-label">主轴转速（编码器）</div>
                  <div class="param-value">{{ currentDeviceParams.spindleSpeed }}</div>
                </div>
              </div>
              <div v-else class="no-data">
                <!-- 暂无数据的样式由CSS控制 -->
              </div>
            </div>
          </div>

          <!-- Right Column: AI Analysis Panel -->
          <div class="right-column">
            <div class="card ai-analysis-card">
              <div class="card-header">
                <h2 class="card-title">AI 故障分析</h2>
                <div v-if="isStreaming" class="streaming-indicator">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>正在流式接收... (第{{ streamingProgress }}条)</span>
                </div>
              </div>
              <div class="ai-analysis-content">
                <div v-if="deviceStatus !== 'fault'" class="no-fault-message">
                  设备运行正常，无故障信息。
                </div>
                <div v-else-if="analysisLoading" class="analysis-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <p>AI正在分析中，请稍候...</p>
                </div>
                <div v-else-if="faultAnalysis" class="analysis-content-wrapper">
                  <div
                    class="markdown-content analysis-result"
                    v-html="md.render(faultAnalysis)"
                  ></div>
                  <div v-if="isStreaming" class="streaming-cursor">|</div>
                </div>
                <div v-else class="prompt-analysis">
                  <p>设备发生故障，点击下方按钮开始AI分析。</p>
                  <el-button type="primary" @click="analyzeFault" :loading="analysisLoading"
                    >开始AI分析</el-button
                  >
                </div>
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
                    style="width: 220px; margin-right: 10px"
                    @change="refreshCharts"
                  />
                  <el-select
                    v-model="chartFilters.shift"
                    placeholder="选择班组"
                    clearable
                    style="width: 120px; margin-right: 10px"
                    @change="refreshCharts"
                  >
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
                <div class="chart-row">
                  <div class="chart-item">
                    <div ref="chart4Ref" class="chart"></div>
                  </div>
                  <div class="chart-item">
                    <div ref="chart5Ref" class="chart"></div>
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
                      <el-select
                        v-model="historyFilters.class_group"
                        placeholder="选择班组"
                        clearable
                      >
                        <el-option label="甲班" value="甲班" />
                        <el-option label="乙班" value="乙班" />
                        <el-option label="丙班" value="丙班" />
                      </el-select>
                    </el-col>
                    <el-col :span="6">
                      <el-input
                        v-model="historyFilters.mch_name"
                        placeholder="故障名称"
                        clearable
                      />
                    </el-col>
                    <el-col :span="4">
                      <el-button
                        type="primary"
                        @click="queryFaultHistory"
                        icon="Search"
                        :loading="isLoadingFaultRecords"
                        >查询</el-button
                      >
                    </el-col>
                  </el-row>
                </div>

                <el-table
                  :data="filteredHistoryRecords"
                  style="width: 100%"
                  stripe
                  v-loading="isLoadingFaultRecords"
                  @row-click="openFaultDetail"
                >
                  <el-table-column prop="mch_name" label="设备名称" width="150" />
                  <el-table-column prop="fault_time" label="故障时间" width="180">
                    <template #default="{ row }">
                      {{ formatDateTime(row.fault_time) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="class_group" label="班组" width="80" />
                  <el-table-column prop="fault_name" label="故障名称" width="150" />
                  <el-table-column prop="mch_params" label="设备参数" width="200">
                    <template #default="{ row }">
                      <div v-if="row.mch_params && typeof row.mch_params === 'object'">
                        <div v-for="(value, key) in row.mch_params" :key="key" class="param-item">
                          {{ key }}: {{ value }}
                        </div>
                      </div>
                      <span v-else>{{ row.mch_params || '-' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="ai_analysis" label="AI分析" />
                  <el-table-column prop="class_shift" label="班次" width="80" />
                </el-table>

                <div class="pagination-container" style="margin-top: 20px; text-align: right">
                  <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="totalRecords"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="queryFaultHistory"
                    @current-change="queryFaultHistory"
                  />
                </div>
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
          <button v-if="!isAnalyzingShift" class="analyze-button" @click="performShiftAnalysis">
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
                <path
                  fill="currentColor"
                  d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                ></path>
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
                  <path
                    fill="currentColor"
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                  ></path>
                </svg>
              </div>
            </div>
            <span>去登陆</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 故障记录详情弹窗 -->
    <el-dialog
      v-model="showFaultDetailDialog"
      title="故障记录详情"
      width="80%"
      :before-close="closeFaultDetail"
      class="fault-detail-dialog"
    >
      <div v-if="selectedFaultRecord" class="fault-detail-content">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>设备名称：</label>
              <span>{{ selectedFaultRecord.mch_name }}</span>
            </div>
            <div class="detail-item">
              <label>故障时间：</label>
              <span>{{ formatDateTime(selectedFaultRecord.fault_time) }}</span>
            </div>
            <div class="detail-item">
              <label>停机时间：</label>
              <span>{{ formatDateTime(selectedFaultRecord.stop_time) }}</span>
            </div>
            <div class="detail-item">
              <label>班组：</label>
              <span>{{ selectedFaultRecord.class_group }}</span>
            </div>
            <div class="detail-item">
              <label>班次：</label>
              <span>{{ selectedFaultRecord.class_shift }}</span>
            </div>
            <div class="detail-item">
              <label>故障名称：</label>
              <span>{{ selectedFaultRecord.fault_name }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>设备参数</h3>
          <div class="params-container">
            <div
              v-if="
                selectedFaultRecord.mch_params && typeof selectedFaultRecord.mch_params === 'object'
              "
            >
              <div
                v-for="(value, key) in selectedFaultRecord.mch_params"
                :key="key"
                class="param-item"
              >
                <strong>{{ key }}:</strong> {{ value }}
              </div>
            </div>
            <div v-else>
              <p>{{ selectedFaultRecord.mch_params || '无设备参数数据' }}</p>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>AI分析结果</h3>
          <div class="ai-analysis-container">
            <div
              v-if="selectedFaultRecord.ai_analysis"
              class="markdown-content"
              v-html="md.render(selectedFaultRecord.ai_analysis)"
            ></div>
            <div v-else class="no-analysis">
              <p>暂无AI分析结果</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeFaultDetail">关闭</el-button>
        </div>
      </template>
    </el-dialog>
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.enhanced-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  content: '';
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
  background: linear-gradient(135deg, #536dfe 0%, #3d5afe 100%);
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
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial,
    sans-serif;
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

/* 标签页导航容器 */
.tab-navigation-container {
  position: relative;
  z-index: 50;
}

/* 移动端展开按钮 */
.tabs-expand-button {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #409eff;
  transition: all 0.3s ease;
}

.tabs-expand-button:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

.tabs-expand-button .el-icon {
  font-size: 16px;
}

.tab-button {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background-color: #f0f2f5;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
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
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.ai-analysis-card {
  flex-grow: 1;
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

.left-column,
.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0; /* 防止flex容器被内容撤开 */
}

/* 设备参数卡片样式 */
.device-params-card {
  background: linear-gradient(135deg, #f8fbff 0%, #f0f8ff 100%);
  border: 2px solid #e1ecf4;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.device-params-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #36a3f7, #409eff);
  background-size: 200% 100%;
  animation: params-gradient 3s ease infinite;
}

@keyframes params-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.device-params-card:hover {
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

/* 设备状态卡片增强样式 */
.device-status-card {
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* 根据设备状态改变背景色 */
.device-status-card.status-running {
  background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
  border: 2px solid #67c23a;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
}

.device-status-card.status-stopped {
  background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
  border: 2px solid #909399;
  box-shadow: 0 4px 12px rgba(144, 147, 153, 0.2);
}

.device-status-card.status-fault {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border: 3px solid #e53935;
  box-shadow: 0 6px 20px rgba(229, 57, 53, 0.4);
  animation: fault-pulse 1.5s ease-in-out infinite;
}

/* 故障状态闪烁动画 */
@keyframes fault-pulse {
  0% {
    box-shadow: 0 6px 20px rgba(229, 57, 53, 0.4);
    border-color: #e53935;
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 30px rgba(229, 57, 53, 0.8);
    border-color: #d32f2f;
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 6px 20px rgba(229, 57, 53, 0.4);
    border-color: #e53935;
    transform: scale(1);
  }
}

/* 增强的状态显示区域 */
.enhanced-status-display {
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

/* 设备信息区域 */
.device-info {
  text-align: center;
  width: 100%;
}

.device-name {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 10px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.device-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.shift-info,
.equipment-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.7);
  padding: 6px 12px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.equipment-name {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

/* 实时监控状态样式 */
.monitoring-status {
  width: 100%;
  margin-top: 15px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.monitoring-active {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitoring-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  color: #67c23a;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #67c23a;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(103, 194, 58, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}

.monitoring-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  font-size: 12px;
}

.info-item .label {
  color: #606266;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
  font-weight: 600;
}

.monitoring-inactive {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 10px;
}

/* 头部操作按钮组 */
.header-actions {
  display: flex;
  gap: 8px;
}

/* 演示功能区域 */
.demo-actions {
  width: 100%;
  margin-top: 20px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(255, 248, 220, 0.8);
  border: 1px solid #fadb14;
  backdrop-filter: blur(10px);
}

.demo-section-title {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #d46b08;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.demo-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.demo-btn {
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 状态指示器中心区域 */
.status-center {
  width: 100%;
  display: flex;
  justify-content: center;
}

.enhanced-status-indicator {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 30px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  position: relative;
  min-width: 280px;
  justify-content: center;
  transition: all 0.3s ease;
}

.enhanced-status-indicator.running {
  background: rgba(103, 194, 58, 0.15);
  border: 2px solid rgba(103, 194, 58, 0.3);
  color: #409eff;
}

.enhanced-status-indicator.stopped {
  background: rgba(144, 147, 153, 0.15);
  border: 2px solid rgba(144, 147, 153, 0.3);
  color: #606266;
}

.enhanced-status-indicator.fault {
  background: linear-gradient(135deg, rgba(229, 57, 53, 0.2), rgba(211, 47, 47, 0.25));
  border: 3px solid rgba(229, 57, 53, 0.6);
  color: #b71c1c;
  animation: status-shake 1s ease-in-out infinite;
  box-shadow: 0 4px 16px rgba(229, 57, 53, 0.3);
}

/* 故障状态摇晃动画 */
@keyframes status-shake {
  0%,
  100% {
    transform: translateX(0) translateY(0);
  }
  10% {
    transform: translateX(-3px) translateY(-1px);
  }
  20% {
    transform: translateX(3px) translateY(1px);
  }
  30% {
    transform: translateX(-3px) translateY(-1px);
  }
  40% {
    transform: translateX(3px) translateY(1px);
  }
  50% {
    transform: translateX(-2px) translateY(0);
  }
  60% {
    transform: translateX(2px) translateY(0);
  }
  70% {
    transform: translateX(-1px) translateY(0);
  }
  80% {
    transform: translateX(1px) translateY(0);
  }
  90% {
    transform: translateX(0) translateY(0);
  }
}

/* 状态图标包装器 */
.status-icon-wrapper {
  position: relative;
}

.status-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.enhanced-status-indicator.running .status-icon {
  color: #67c23a;
  animation: running-rotate 3s linear infinite;
}

.enhanced-status-indicator.stopped .status-icon {
  color: #909399;
}

.enhanced-status-indicator.fault .status-icon {
  color: #d32f2f;
  animation: fault-bounce 0.8s ease-in-out infinite;
  filter: drop-shadow(0 2px 8px rgba(229, 57, 53, 0.6));
}

/* 运行状态旋转动画 */
@keyframes running-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 故障状态跳动动画 */
@keyframes fault-bounce {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.15) rotate(-5deg);
  }
  75% {
    transform: scale(1.15) rotate(5deg);
  }
}

/* 状态内容 */
.status-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}

/* 故障状态下的状态文字加强 */
.enhanced-status-indicator.fault .status-text {
  font-size: 20px;
  font-weight: 800;
  text-shadow: 0 1px 3px rgba(183, 28, 28, 0.3);
  color: #b71c1c;
}

.fault-name-emphasis {
  font-size: 16px;
  font-weight: 700;
  margin-top: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border-radius: 12px;
  border: 2px solid #e53935;
  color: #b71c1c;
  text-align: center;
  box-shadow: 0 3px 12px rgba(229, 57, 53, 0.3);
  animation: fault-name-glow 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.fault-name-emphasis::before {
  content: '⚠️ 故障详情';
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #d32f2f;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 故障名称发光动画 */
@keyframes fault-name-glow {
  0% {
    box-shadow: 0 3px 12px rgba(229, 57, 53, 0.3);
  }
  50% {
    box-shadow: 0 5px 20px rgba(229, 57, 53, 0.6);
  }
  100% {
    box-shadow: 0 3px 12px rgba(229, 57, 53, 0.3);
  }
}

/* 操作按钮区域 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 5px;
}

.action-btn {
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* AI分析卡片增强样式 */
.ai-analysis-card {
  max-width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e1;
  box-shadow: 0 4px 15px rgba(148, 163, 184, 0.15);
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-analysis-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
  pointer-events: none;
}

.ai-analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(148, 163, 184, 0.2);
}

.ai-analysis-card .card-header {
  background: rgba(248, 250, 252, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(203, 213, 225, 0.5);
  color: #475569;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ai-analysis-card .card-title {
  color: #334155;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(71, 85, 105, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.ai-analysis-card .card-title::before {
  content: '🤖';
  font-size: 24px;
  filter: drop-shadow(0 1px 2px rgba(71, 85, 105, 0.2));
}

.ai-analysis-content {
  max-height: calc(100vh - 10px);
  min-height: 600px;
  overflow-y: auto;
  word-break: break-word;
  overflow-wrap: break-word;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin: 15px;
  position: relative;
  z-index: 1;
  padding: 20px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 流式状态指示器增强 */
.streaming-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 12px;
  background: rgba(248, 250, 252, 0.8);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(203, 213, 225, 0.6);
  backdrop-filter: blur(5px);
  animation: streaming-pulse-soft 2s ease-in-out infinite;
}

@keyframes streaming-pulse-soft {
  0%,
  100% {
    background: rgba(248, 250, 252, 0.8);
    box-shadow: 0 0 8px rgba(148, 163, 184, 0.2);
  }
  50% {
    background: rgba(241, 245, 249, 0.9);
    box-shadow: 0 0 15px rgba(148, 163, 184, 0.3);
  }
}

.streaming-indicator .el-icon {
  font-size: 16px;
  color: #3b82f6;
  filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.4));
}

/* 无故障消息美化 */
.no-fault-message {
  text-align: center;
  padding: 60px 20px;
  color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 12px;
  border: 2px solid #a7f3d0;
  position: relative;
  overflow: hidden;
}

.no-fault-message::before {
  content: '✅';
  display: block;
  font-size: 48px;
  margin-bottom: 15px;
  filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
}

.no-fault-message::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  animation: status-shimmer 3s ease-in-out infinite;
}

/* AI分析加载状态美化 */
.analysis-loading {
  text-align: center;
  padding: 60px 20px;
  color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 12px;
  border: 2px solid #93c5fd;
  position: relative;
  overflow: hidden;
}

.analysis-loading .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #3b82f6;
  filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4));
}

.analysis-loading p {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(59, 130, 246, 0.2);
}

.analysis-loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: loading-shimmer 2s ease-in-out infinite;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 提示分析美化 */
.prompt-analysis {
  text-align: center;
  padding: 60px 20px;
  color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 12px;
  border: 2px solid #fbbf24;
  position: relative;
  overflow: hidden;
}

.prompt-analysis::before {
  content: '⚠️';
  display: block;
  font-size: 48px;
  margin-bottom: 15px;
  filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
}

.prompt-analysis p {
  margin-bottom: 25px;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(245, 158, 11, 0.2);
}

.prompt-analysis .el-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  transition: all 0.3s ease;
}

.prompt-analysis .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
}

/* 分析内容包装器美化 */
.analysis-content-wrapper {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 流式输入光标增强 */
.streaming-cursor {
  display: inline-block;
  color: #3b82f6;
  font-weight: bold;
  font-size: 18px;
  animation: cursor-blink 1s infinite;
  margin-left: 3px;
  text-shadow: 0 0 5px rgba(59, 130, 246, 0.6);
}

@keyframes cursor-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes status-shimmer {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 老版本状态显示区域 - 已替换为增强版本 */
.status-display {
  text-align: center;
  padding: 20px;
}

.status-display h3 {
  margin-top: 0;
  color: #606266;
}

/* 老版本状态指示器 - 已替换为增强版本 */
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
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}

.fault-name-emphasis {
  font-weight: bold;
  text-decoration: underline;
  margin-left: 10px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.param-item {
  display: flex;
  flex-direction: column;
  padding: 12px 10px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 8px;
  border: 1px solid #e1ecf4;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.08);
  overflow: hidden;
  min-height: 65px;
}

.param-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #409eff, #67c23a, #e6a23c, #f56c6c);
  opacity: 0.8;
}

.param-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.15);
  border-color: #409eff;
}

.param-item:hover::before {
  width: 6px;
  opacity: 1;
}

/* 参数标签样式 */
.param-label {
  font-size: 11px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.param-label::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
  opacity: 0.6;
}

/* 参数数值样式 */
.param-value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  line-height: 1.2;
}

/* 为不同参数添加不同的主题色 */
.param-item:nth-child(1) .param-label::before {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
}

.param-item:nth-child(2) .param-label::before {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
}

.param-item:nth-child(3) .param-label::before {
  background: linear-gradient(45deg, #45b7d1, #96c93d);
}

.param-item:nth-child(4) .param-label::before {
  background: linear-gradient(45deg, #f7b731, #5f27cd);
}

/* 数值动画效果 */
.param-value {
  position: relative;
  overflow: hidden;
}

.param-value::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: param-shine 3s ease-in-out infinite;
}

@keyframes param-shine {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

.no-fault-message,
.prompt-analysis {
  text-align: center;
  padding: 40px 20px;
  /* 具体样式在上面已经定义 */
}

.prompt-analysis p {
  margin-bottom: 20px;
}

.analysis-loading {
  text-align: center;
  padding: 40px 20px;
  /* 具体样式在上面已经定义 */
}

.analysis-loading .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.markdown-content {
  line-height: 1.8;
  color: #333;
  font-size: 14px;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.markdown-content.analysis-result {
  max-height: none;
  height: 100%;
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  flex: 1;
}

.markdown-content.analysis-result::-webkit-scrollbar {
  width: 6px;
}

.markdown-content.analysis-result::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.markdown-content.analysis-result::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.markdown-content.analysis-result::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 标题样式 */
.markdown-content :deep(h1) {
  color: #303133;
  font-size: 24px;
  font-weight: 700;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.markdown-content :deep(h2) {
  color: #409eff;
  font-size: 20px;
  font-weight: 600;
  margin: 18px 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}

.markdown-content :deep(h3) {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
  margin: 16px 0 10px 0;
  padding-bottom: 4px;
  border-bottom: 1px dotted #ebeef5;
}

.markdown-content :deep(h4) {
  color: #606266;
  font-size: 16px;
  font-weight: 600;
  margin: 14px 0 8px 0;
}

.markdown-content :deep(h5) {
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 6px 0;
}

.markdown-content :deep(h6) {
  color: #909399;
  font-size: 13px;
  font-weight: 600;
  margin: 10px 0 5px 0;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin-bottom: 12px;
  line-height: 1.7;
  text-align: justify;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 12px 0;
  padding-left: 25px;
}

.markdown-content :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
}

.markdown-content :deep(ul ul),
.markdown-content :deep(ol ol) {
  margin: 6px 0;
}

/* 强调样式 */
.markdown-content :deep(strong) {
  color: #409eff;
  font-weight: 700;
}

.markdown-content :deep(em) {
  color: #67c23a;
  font-style: italic;
}

.markdown-content :deep(mark) {
  background-color: #fff566;
  padding: 2px 4px;
  border-radius: 3px;
}

/* 代码样式 */
.markdown-content :deep(code) {
  background: #f1f2f6;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #e83e8c;
  border: 1px solid #e9ecef;
}

.markdown-content :deep(pre) {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #333;
  border: none;
  font-size: 13px;
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding: 12px 16px;
  margin: 16px 0;
  background: #f8f9ff;
  border-radius: 4px;
  color: #666;
  font-style: italic;
}

.markdown-content :deep(blockquote p) {
  margin: 0;
}

/* 表格样式 */
.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.markdown-content :deep(thead) {
  background: linear-gradient(135deg, #409eff 0%, #36a3f7 100%);
}

.markdown-content :deep(th) {
  background: transparent;
  color: #000000;
  font-weight: 700;
  padding: 12px 8px;
  text-align: left;
  border: none;
  text-shadow: none;
}

.markdown-content :deep(td) {
  padding: 10px 8px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
}

.markdown-content :deep(tbody tr:nth-child(even)) {
  background-color: #fafafa;
}

.markdown-content :deep(tbody tr:hover) {
  background-color: #f0f9ff;
}

/* 分割线样式 */
.markdown-content :deep(hr) {
  border: none;
  border-top: 2px solid #ebeef5;
  margin: 20px 0;
  background: linear-gradient(to right, transparent, #ebeef5, transparent);
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: #409eff;
  text-decoration: none;
  border-bottom: 1px dotted #409eff;
  transition: all 0.3s ease;
}

.markdown-content :deep(a:hover) {
  color: #66b1ff;
  border-bottom: 1px solid #66b1ff;
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 10px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 任务列表样式 */
.markdown-content :deep(input[type='checkbox']) {
  margin-right: 8px;
  transform: scale(1.2);
}

/* 脚注样式 */
.markdown-content :deep(sup) {
  font-size: 0.75em;
  vertical-align: super;
  color: #409eff;
}

/* 键盘按键样式 */
.markdown-content :deep(kbd) {
  background: #f7f7f7;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.2),
    0 0 0 2px #fff inset;
  color: #333;
  display: inline-block;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.4;
  margin: 0 0.1em;
  padding: 0.1em 0.6em;
  text-shadow: 0 1px 0 #fff;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
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
  color: #87ceeb;
  margin-top: 20px;
  margin-bottom: 0;
}

.jump-letter {
  display: inline-block;
  animation: jump 1s ease-in-out infinite;
}

.jump-letter:nth-child(1) {
  animation-delay: 0s;
}
.jump-letter:nth-child(2) {
  animation-delay: 0.1s;
}
.jump-letter:nth-child(3) {
  animation-delay: 0.2s;
}
.jump-letter:nth-child(4) {
  animation-delay: 0.3s;
}
.jump-letter:nth-child(5) {
  animation-delay: 0.4s;
}

@keyframes jump {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.analyze-button.is-analyzing {
  pointer-events: none;
  background-color: #a0cfff;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 2px dashed #d3d3d3;
  margin: 20px;
  position: relative;
  overflow: hidden;
}

.no-data::before {
  content: '📄';
  display: block;
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.6;
  animation: float 3s ease-in-out infinite;
}

.no-data::after {
  content: '暂无参数数据';
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 登录提示弹窗样式 */
.login-prompt-container {
  max-width: 320px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow:
    0 15px 35px rgba(50, 50, 93, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.07);
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
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
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
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
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
  /* 确保图表容器有明确的尺寸 */
  min-width: 100%;
  min-height: 300px;
  /* 修复图表在切换时被挤压的问题 */
  box-sizing: border-box;
  display: block;
  overflow: hidden;
}

/* 图表容器动画效果优化 */
.chart-item {
  flex: 1;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  /* 确保容器在切换时不会折叠 */
  min-width: 0;
  /* 修复图表被挤压问题 */
  transition: all 0.3s ease;
}

/* 特别为图表容器添加显示状态 */
.chart-item[data-chart-loading='true'] .chart {
  opacity: 0.5;
  pointer-events: none;
}

.chart-item[data-chart-loaded='true'] .chart {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.3s ease;
}

/* 添加图表容器的过渡动画，解决切换时的视觉闪烁 */
.charts-container {
  /* 确保图表容器在切换时有平滑的过渡效果 */
  transition: all 0.3s ease;
}

/* 确保图表在标签页切换时正确显示 */
.fault-dashboard .el-tab-pane {
  /* 确保标签页内容区域有正确的尺寸 */
  min-height: 500px;
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
    height: 100vh;
    min-height: 100%;
    box-sizing: border-box;
  }

  /* 标签页导航 */
  .tab-navigation {
    flex-direction: column;
    gap: 5px;
    display: none; /* 默认隐藏 */
  }

  .tab-navigation.expanded {
    display: flex; /* 展开时显示 */
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 100;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  /* 浮动菜单中的按钮样式优化 */
  .tab-navigation.expanded .tab-button {
    border-radius: 0;
    border-bottom: 1px solid #f0f2f5;
    margin: 0;
  }

  .tab-navigation.expanded .tab-button:last-child {
    border-bottom: none;
    border-radius: 0 0 8px 8px;
  }

  .tab-navigation.expanded .tab-button:first-child {
    border-radius: 8px 8px 0 0;
  }

  /* 显示展开按钮 */
  .tabs-expand-button {
    display: flex;
    justify-content: center;
    margin-bottom: 0; /* 移除底部边距，因为现在是浮动布局 */
  }

  /* 浮动菜单容器调整 */
  .tab-navigation-container {
    margin-bottom: 0; /* 移除底部边距 */
  }

  /* 确保浮动菜单不影响其他内容 */
  .tab-content {
    margin-top: 0; /* 移除顶部边距 */
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

  .left-column,
  .right-column {
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
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .param-item {
    padding: 8px 6px;
    min-height: 55px;
  }

  .param-value {
    font-size: 14px;
  }

  .param-label {
    font-size: 10px;
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
    gap: 20px;
    margin-bottom: 20px;
  }

  .chart-item {
    margin-bottom: 10px;
    padding: 12px;
    min-height: 280px;
  }

  .chart {
    height: 260px;
  }

  .charts-container {
    padding: 12px;
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

  .tab-navigation {
    gap: 3px;
  }

  .tab-button {
    padding: 10px 12px;
    font-size: 13px;
  }

  .tab-content {
    padding: 10px;
  }

  .monitoring-layout {
    gap: 10px;
  }

  .status-display h3 {
    font-size: 14px;
  }

  .status-indicator {
    padding: 8px 12px;
    font-size: 12px;
  }

  .params-grid {
    gap: 8px;
  }

  .param-item {
    padding: 6px 8px;
    font-size: 12px;
  }

  .chart-row {
    gap: 15px;
    margin-bottom: 15px;
  }

  .chart-item {
    padding: 8px;
    min-height: 240px;
  }

  .chart {
    height: 220px;
  }

  .charts-container {
    padding: 8px;
  }

  .history-records {
    padding: 10px;
  }

  .filters {
    padding: 10px;
    margin-bottom: 10px;
  }

  .el-table {
    font-size: 11px;
  }

  .el-table .cell {
    padding: 4px 2px;
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
/* 设备参数样式 */
.param-item {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
  padding: 2px 6px;
  background-color: #f5f7fa;
  border-radius: 3px;
  display: inline-block;
  margin-right: 5px;
}

.param-item:not(:last-child) {
  margin-bottom: 3px;
}

/* 故障记录详情弹窗样式 */
.fault-detail-dialog {
  border-radius: 12px;
}

.fault-detail-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px 12px 0 0;
}

.fault-detail-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.fault-detail-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 20px;
}

.fault-detail-content {
  padding: 20px 0;
}

.detail-section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.detail-section h3::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #667eea;
  margin-right: 8px;
  border-radius: 2px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.detail-item label {
  font-weight: 600;
  color: #555;
  margin-right: 8px;
  min-width: 80px;
}

.detail-item span {
  color: #333;
  font-size: 14px;
}

.params-container {
  background: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.params-container .param-item {
  display: block;
  margin: 8px 0;
  padding: 8px 12px;
  background: #f1f3f4;
  border-radius: 4px;
  border-left: 3px solid #667eea;
  font-size: 13px;
}

.params-container .param-item strong {
  color: #667eea;
  font-weight: 600;
}

.ai-analysis-container {
  background: white;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 100px;
}

.ai-analysis-container .markdown-content {
  line-height: 1.6;
  color: #333;
}

.ai-analysis-container .markdown-content h1,
.ai-analysis-container .markdown-content h2,
.ai-analysis-container .markdown-content h3 {
  color: #667eea;
  margin-top: 15px;
  margin-bottom: 10px;
}

.ai-analysis-container .markdown-content p {
  margin-bottom: 10px;
}

.ai-analysis-container .markdown-content code {
  background: #f1f3f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
}

.ai-analysis-container .markdown-content pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}

.no-analysis {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
}

.dialog-footer {
  text-align: right;
  padding: 15px 0 0 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .fault-detail-dialog .el-dialog {
    width: 95% !important;
    margin: 10px auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-section {
    padding: 15px;
    margin-bottom: 15px;
  }

  .params-container,
  .ai-analysis-container {
    padding: 15px;
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
