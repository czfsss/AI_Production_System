import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'

interface DeviceInfo {
  type: string
  number: string
  shift: string
}

interface MonitoringStats {
  connectionStatus: string
  lastCheckTime: string
  totalChecks: number
  consecutiveFaults: number
  consecutiveRunning: number
}

interface FaultAlert {
  id: string
  faultName: string
  deviceInfo: DeviceInfo | null
  timestamp: Date
  isActive: boolean
  aiAnalysis: string
}

export const useMonitoringStore = defineStore('monitoring', () => {
  // 监控状态
  const isMonitoring = ref(false)
  const isDeviceBound = ref(false)
  const deviceStatus = ref<'running' | 'stopped' | 'fault'>('stopped')
  const faultName = ref('')
  const equipmentName = ref('')
  const boundDeviceInfo = ref<DeviceInfo | null>(null)
  const monitoringStats = ref<MonitoringStats>({
    connectionStatus: '未连接',
    lastCheckTime: '',
    totalChecks: 0,
    consecutiveFaults: 0,
    consecutiveRunning: 0
  })

  // 故障警告
  const activeFaultAlerts = ref<FaultAlert[]>([])
  const showFaultAlert = ref(false)
  const currentFaultAlert = ref<FaultAlert | null>(null)

  // 计算属性
  const hasActiveFaults = computed(() => activeFaultAlerts.value.length > 0)
  const latestFaultAlert = computed(() => {
    return activeFaultAlerts.value.length > 0 
      ? activeFaultAlerts.value[activeFaultAlerts.value.length - 1] 
      : null
  })

  // 设置监控状态
  const setMonitoringStatus = (status: boolean) => {
    isMonitoring.value = status
  }

  // 设置设备绑定状态
  const setDeviceBinding = (bound: boolean, deviceInfo?: DeviceInfo | null, equipName?: string) => {
    isDeviceBound.value = bound
    if (deviceInfo) {
      boundDeviceInfo.value = deviceInfo
    }
    if (equipName) {
      equipmentName.value = equipName
    }
  }

  // 更新设备状态
  const updateDeviceStatus = (status: 'running' | 'stopped' | 'fault', fault?: string) => {
    const previousStatus = deviceStatus.value
    deviceStatus.value = status
    
    if (fault) {
      faultName.value = fault
    }

    // 如果是故障状态，创建故障警告
    if (status === 'fault' && previousStatus !== 'fault') {
      createFaultAlert(fault || '未知故障')
    }

    // 如果从故障状态恢复，移除相关警告
    if (previousStatus === 'fault' && status !== 'fault') {
      removeFaultAlerts()
    }
  }

  // 更新监控统计
  const updateMonitoringStats = (stats: Partial<MonitoringStats>) => {
    monitoringStats.value = { ...monitoringStats.value, ...stats }
  }

  // 创建故障警告
  const createFaultAlert = (faultNameValue: string) => {
    const alertId = `fault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newAlert: FaultAlert = {
      id: alertId,
      faultName: faultNameValue,
      deviceInfo: boundDeviceInfo.value,
      timestamp: new Date(),
      isActive: true,
      aiAnalysis: ''
    }

    activeFaultAlerts.value.push(newAlert)
    currentFaultAlert.value = newAlert
    
    // 显示通知
    ElMessage.error(`设备发生故障: ${faultNameValue}`)
    
    // 注意：showFaultAlert的值由GlobalFaultAlert组件根据当前路由决定
    // 在监控页面时，GlobalFaultAlert组件会自动隐藏弹窗
    // 在非监控页面时，才显示弹窗
    showFaultAlert.value = true
  }

  // 更新故障警告的AI分析结果
  const updateFaultAlertAnalysis = (alertId: string, analysis: string) => {
    const alert = activeFaultAlerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.aiAnalysis = analysis
      if (currentFaultAlert.value?.id === alertId) {
        // 创建一个新的对象引用，确保Vue的响应式系统能够检测到变化
        currentFaultAlert.value = { ...alert }
      }
    }
  }

  // 移除故障警告
  const removeFaultAlert = (alertId: string) => {
    const index = activeFaultAlerts.value.findIndex(a => a.id === alertId)
    if (index !== -1) {
      activeFaultAlerts.value.splice(index, 1)
      
      if (currentFaultAlert.value?.id === alertId) {
        currentFaultAlert.value = activeFaultAlerts.value.length > 0 
          ? activeFaultAlerts.value[activeFaultAlerts.value.length - 1] 
          : null
        showFaultAlert.value = currentFaultAlert.value !== null
      }
    }
  }

  // 移除所有故障警告
  const removeFaultAlerts = () => {
    activeFaultAlerts.value = []
    currentFaultAlert.value = null
    showFaultAlert.value = false
  }

  // 关闭当前故障警告
  const closeCurrentFaultAlert = () => {
    if (currentFaultAlert.value) {
      removeFaultAlert(currentFaultAlert.value.id)
    }
  }

  // 重置所有状态
  const resetAll = () => {
    isMonitoring.value = false
    isDeviceBound.value = false
    deviceStatus.value = 'stopped'
    faultName.value = ''
    equipmentName.value = ''
    boundDeviceInfo.value = null
    monitoringStats.value = {
      connectionStatus: '未连接',
      lastCheckTime: '',
      totalChecks: 0,
      consecutiveFaults: 0,
      consecutiveRunning: 0
    }
    removeFaultAlerts()
  }

  return {
    // 状态
    isMonitoring,
    isDeviceBound,
    deviceStatus,
    faultName,
    equipmentName,
    boundDeviceInfo,
    monitoringStats,
    activeFaultAlerts,
    showFaultAlert,
    currentFaultAlert,
    
    // 计算属性
    hasActiveFaults,
    latestFaultAlert,
    
    // 方法
    setMonitoringStatus,
    setDeviceBinding,
    updateDeviceStatus,
    updateMonitoringStats,
    createFaultAlert,
    updateFaultAlertAnalysis,
    removeFaultAlert,
    removeFaultAlerts,
    closeCurrentFaultAlert,
    resetAll
  }
})