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
  currentDeviceParams: Ref<any>,
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

  // 更新设备参数
  const updateDeviceParams = () => {
    if (!currentDeviceParams.value) return
    
    // 根据设备状态更新参数
    if (deviceStatus.value === 'running') {
      // 设备运行时，生成随机参数值
      currentDeviceParams.value = {
        productionSpeed: `${Math.floor(Math.random() * 2000 + 8000)} 支/分钟`,
        weightStandardDeviation: `${(Math.random() * 0.02 + 0.01).toFixed(3)}g`,
        compressedAirPressure: `${(Math.random() * 1 + 5.5).toFixed(1)} bar`,
        compressedAirFlowCigarette: `${(Math.random() * 1 + 4).toFixed(1)} m³/h`,
        compressedAirFlowAssembly: `${(Math.random() * 1 + 3).toFixed(1)} m³/h`,
        vacuumSystemPressure: `${(Math.random() * 0.1 - 0.55).toFixed(1)} bar`,
        dustCollectionPressure: `${(Math.random() * 1.5 - 9).toFixed(2)} kPa`,
        looseEndRejectRate: `${(Math.random() * 0.15).toFixed(2)}%`,
        oee: `${(Math.random() * 5 + 90).toFixed(1)}%`,
        airChamberNegativePressure: `${(Math.random() * 0.05 - 0.075).toFixed(3)} MPa`,
        solderingIronTemperature: `${Math.floor(Math.random() * 50 + 350)}℃`,
        averageCigaretteWeight: `${(Math.random() * 20 + 80).toFixed(1)}mg`,
        cutterVibrationAmplitude: `${(Math.random() * 2 + 1).toFixed(1)}mm/s`,
        gluePumpPressure: `${(Math.random() * 2 + 6).toFixed(1)} bar`,
        cigaretteLength: `${(Math.random() * 5 + 82.5).toFixed(1)}mm`,
        spindleSpeed: `${Math.floor(Math.random() * 500 + 2000)}rpm`
      }
    } else if (deviceStatus.value === 'stopped') {
      // 设备停机时，参数归零或接近零
      currentDeviceParams.value = {
        productionSpeed: '0 支/分钟',
        weightStandardDeviation: '0.000g',
        compressedAirPressure: '0.0 bar',
        compressedAirFlowCigarette: '0.0 m³/h',
        compressedAirFlowAssembly: '0.0 m³/h',
        vacuumSystemPressure: '0.0 bar',
        dustCollectionPressure: '0.0 kPa',
        looseEndRejectRate: '0.0%',
        oee: '0.0%',
        airChamberNegativePressure: '0.0 MPa',
        solderingIronTemperature: '0℃',
        averageCigaretteWeight: '0.0mg',
        cutterVibrationAmplitude: '0.0mm/s',
        gluePumpPressure: '0.0 bar',
        cigaretteLength: '0.0mm',
        spindleSpeed: '0rpm'
      }
    } else if (deviceStatus.value === 'fault') {
      // 设备故障时，参数异常
      currentDeviceParams.value = {
        productionSpeed: `${Math.floor(Math.random() * 1000)} 支/分钟`,
        weightStandardDeviation: `${(Math.random() * 0.05 + 0.03).toFixed(3)}g`,
        compressedAirPressure: `${(Math.random() * 2 + 3).toFixed(1)} bar`,
        compressedAirFlowCigarette: `${(Math.random() * 2 + 2).toFixed(1)} m³/h`,
        compressedAirFlowAssembly: `${(Math.random() * 2 + 1).toFixed(1)} m³/h`,
        vacuumSystemPressure: `${(Math.random() * 0.2 - 0.3).toFixed(1)} bar`,
        dustCollectionPressure: `${(Math.random() * 2 - 5).toFixed(2)} kPa`,
        looseEndRejectRate: `${(Math.random() * 0.5 + 0.3).toFixed(2)}%`,
        oee: `${(Math.random() * 20 + 30).toFixed(1)}%`,
        airChamberNegativePressure: `${(Math.random() * 0.1 - 0.05).toFixed(3)} MPa`,
        solderingIronTemperature: `${Math.floor(Math.random() * 100 + 200)}℃`,
        averageCigaretteWeight: `${(Math.random() * 50 + 50).toFixed(1)}mg`,
        cutterVibrationAmplitude: `${(Math.random() * 5 + 5).toFixed(1)}mm/s`,
        gluePumpPressure: `${(Math.random() * 3 + 2).toFixed(1)} bar`,
        cigaretteLength: `${(Math.random() * 10 + 75).toFixed(1)}mm`,
        spindleSpeed: `${Math.floor(Math.random() * 1000 + 1000)}rpm`
      }
    }
    
    // 保存到localStorage
    localStorage.setItem('currentDeviceParams', JSON.stringify(currentDeviceParams.value))
    
    console.log(`[设备监控] ${equipmentName.value} 参数已更新`)
  }

  // 单次状态检查
  const checkDeviceStatus = async (): Promise<void> => {
    if (!isDeviceBound.value || !boundDeviceInfo.value) {
      return
    }

    // 检查是否为13#或14#设备，这些设备不请求真实数据
    if (boundDeviceInfo.value.number === 13 || boundDeviceInfo.value.number === 14) {
      // 如果是模拟故障状态，不强制设置为运行状态，让模拟故障逻辑生效
      if (!isSimulatedFault.value) {
        // 确保设备状态为运行
        if (deviceStatus.value !== 'running') {
          deviceStatus.value = 'running'
          faultName.value = ''
          localStorage.setItem('deviceStatus', deviceStatus.value)
          localStorage.setItem('faultName', faultName.value)
        }
        
        // 更新设备参数为运行状态
        updateDeviceParams()
      }
      
      // 更新统计信息
      monitoringStats.value.lastCheckTime = new Date().toLocaleTimeString()
      monitoringStats.value.totalChecks++
      
      console.log(`[设备监控] ${equipmentName.value} 为特殊设备，${isSimulatedFault.value ? '当前为模拟故障状态' : '保持正常运行状态'}`)
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
          
          // 更新设备参数
          updateDeviceParams()
          
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
          
          // 更新设备参数
          updateDeviceParams()
          
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
          
          // 更新设备参数
          updateDeviceParams()
          
          // 保存状态到localStorage
          localStorage.setItem('deviceStatus', deviceStatus.value)
          localStorage.setItem('faultName', faultName.value)
          
          ElMessage.success('设备已恢复正常运行')
          
          // 切换回正常监控间隔
          updateMonitoringInterval(normalInterval)
        } else if (deviceStatus.value === 'stopped') {
          // 从停机状态变为运行状态
          deviceStatus.value = 'running'
          
          // 更新设备参数
          updateDeviceParams()
          
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
    setSimulatedFault,
    updateDeviceParams
  }
}
