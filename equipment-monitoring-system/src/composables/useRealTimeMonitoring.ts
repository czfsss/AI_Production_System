import { ref, computed, watch, onUnmounted, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  queryEquipmentStatus, 
  formatEquipmentName, 
  isEquipmentFaulty, 
  extractFaultName 
} from '../services/equipmentMonitor'

interface BoundDeviceInfo {
  type: string
  number: string | number
  shift: string
  id: string
}

export function useRealTimeMonitoring(
  isDeviceBound: Ref<boolean>,
  boundDeviceInfo: Ref<BoundDeviceInfo | null>,
  deviceStatus: Ref<'running' | 'stopped' | 'fault'>,
  faultName: Ref<string>,
  onFaultDetected?: () => Promise<void>
) {
  // 标记是否为模拟故障状态
  const isSimulatedFault = ref(false)
  // 监控状态
  const isMonitoring = ref(false)
  const monitoringInterval = ref<number | null>(null)
  const currentInterval = ref(2000) // 当前监控间隔（毫秒）
  const normalInterval = 2000 // 正常状态下2秒查询一次
  const faultInterval = 5000 // 故障状态下5秒查询一次
  
  // 监控统计
  const monitoringStats = ref({
    lastCheckTime: '',
    totalChecks: 0,
    consecutiveFaults: 0,
    consecutiveRunning: 0
  })

  // 计算设备名称
  const equipmentName = computed(() => {
    if (!boundDeviceInfo.value) return ''
    return formatEquipmentName(boundDeviceInfo.value.type, boundDeviceInfo.value.number)
  })

  // 单次状态检查
  const checkDeviceStatus = async (): Promise<void> => {
    if (!isDeviceBound.value || !boundDeviceInfo.value) {
      return
    }

    // 如果是模拟故障状态，跳过状态更新，但继续监控统计
    if (isSimulatedFault.value) {
      monitoringStats.value.lastCheckTime = new Date().toLocaleTimeString()
      monitoringStats.value.totalChecks++
      console.log(`[设备监控] ${equipmentName.value} 当前为模拟故障状态，跳过API状态更新`)
      return
    }

    try {
      const response = await queryEquipmentStatus(equipmentName.value)
      const status = response.equipment_status
      
      // 更新统计信息
      monitoringStats.value.lastCheckTime = new Date().toLocaleTimeString()
      monitoringStats.value.totalChecks++
      
      console.log(`[设备监控] ${equipmentName.value} 状态: ${status}`)
      
      const isFaulty = isEquipmentFaulty(status)
      const currentFaultName = extractFaultName(status)
      
      if (isFaulty) {
        // 设备故障
        monitoringStats.value.consecutiveFaults++
        monitoringStats.value.consecutiveRunning = 0
        
        if (deviceStatus.value !== 'fault') {
          // 新故障发生
          deviceStatus.value = 'fault'
          faultName.value = currentFaultName
          
          // 保存状态到localStorage
          localStorage.setItem('deviceStatus', deviceStatus.value)
          localStorage.setItem('faultName', faultName.value)
          
          ElMessage.error(`设备发生故障: ${currentFaultName}`)
          
          // 切换到故障监控间隔
          updateMonitoringInterval(faultInterval)
          
          // 触发AI分析
          if (onFaultDetected) {
            try {
              await onFaultDetected()
            } catch (error) {
              console.warn('自动故障分析失败:', error)
            }
          }
        } else if (faultName.value !== currentFaultName) {
          // 故障类型发生变化
          faultName.value = currentFaultName
          localStorage.setItem('faultName', faultName.value)
          ElMessage.warning(`故障类型变更: ${currentFaultName}`)
          
          // 重新触发AI分析
          if (onFaultDetected) {
            try {
              await onFaultDetected()
            } catch (error) {
              console.warn('自动故障分析失败:', error)
            }
          }
        }
      } else {
        // 设备正常运行
        monitoringStats.value.consecutiveRunning++
        monitoringStats.value.consecutiveFaults = 0
        
        if (deviceStatus.value === 'fault') {
          // 从故障状态恢复
          deviceStatus.value = 'running'
          faultName.value = ''
          
          // 保存状态到localStorage
          localStorage.setItem('deviceStatus', deviceStatus.value)
          localStorage.setItem('faultName', faultName.value)
          
          ElMessage.success('设备已恢复正常运行')
          
          // 切换回正常监控间隔
          updateMonitoringInterval(normalInterval)
        } else if (deviceStatus.value === 'stopped') {
          // 从停机状态变为运行状态
          deviceStatus.value = 'running'
          localStorage.setItem('deviceStatus', deviceStatus.value)
        }
      }
      
    } catch (error) {
      console.error('[设备监控] 查询状态失败:', error)
      // 网络错误不改变设备状态，只记录错误
      if (monitoringStats.value.totalChecks % 10 === 0) {
        // 每10次错误显示一次提示，避免过多提示
        ElMessage.warning('设备状态查询失败，请检查网络连接')
      }
    }
  }

  // 更新监控间隔
  const updateMonitoringInterval = (newInterval: number) => {
    if (currentInterval.value === newInterval) return
    
    currentInterval.value = newInterval
    
    if (isMonitoring.value) {
      // 重新启动监控以应用新间隔
      stopMonitoring()
      startMonitoring()
    }
  }

  // 开始监控
  const startMonitoring = () => {
    if (isMonitoring.value || !isDeviceBound.value) {
      return
    }
    
    console.log(`[设备监控] 开始监控设备: ${equipmentName.value}，间隔: ${currentInterval.value}ms`)
    
    isMonitoring.value = true
    
    // 重置统计
    monitoringStats.value = {
      lastCheckTime: '',
      totalChecks: 0,
      consecutiveFaults: 0,
      consecutiveRunning: 0
    }
    
    // 立即检查一次
    checkDeviceStatus()
    
    // 设置定时检查
    monitoringInterval.value = window.setInterval(() => {
      checkDeviceStatus()
    }, currentInterval.value)
    
    ElMessage.success('已开始实时监控设备状态')
  }

  // 停止监控
  const stopMonitoring = () => {
    if (!isMonitoring.value) {
      return
    }
    
    console.log('[设备监控] 停止监控')
    
    isMonitoring.value = false
    
    if (monitoringInterval.value) {
      clearInterval(monitoringInterval.value)
      monitoringInterval.value = null
    }
    
    ElMessage.info('已停止设备状态监控')
  }

  // 手动刷新状态
  const refreshStatus = async () => {
    if (!isDeviceBound.value) {
      ElMessage.warning('请先绑定设备')
      return
    }
    
    await checkDeviceStatus()
    ElMessage.success('设备状态已刷新')
  }

  // 监听设备绑定状态变化
  watch(isDeviceBound, (newValue) => {
    if (newValue) {
      // 设备绑定后自动开始监控
      setTimeout(() => {
        startMonitoring()
      }, 1000) // 延迟1秒开始监控
    } else {
      // 设备解绑后停止监控
      stopMonitoring()
    }
  }, { immediate: true })

  // 组件卸载时清理
  onUnmounted(() => {
    stopMonitoring()
  })

  // 设置模拟故障状态
  const setSimulatedFault = (simulated: boolean) => {
    isSimulatedFault.value = simulated
    console.log(`[设备监控] 模拟故障状态: ${simulated ? '开启' : '关闭'}`)
  }

  return {
    isMonitoring,
    currentInterval,
    monitoringStats,
    equipmentName,
    startMonitoring,
    stopMonitoring,
    refreshStatus,
    checkDeviceStatus,
    setSimulatedFault
  }
}
