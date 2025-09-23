import { ref, computed, watch, onUnmounted, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  formatEquipmentName, 
  isEquipmentFaulty, 
  extractFaultName 
} from '../services/equipmentMonitor'
import { createWebSocketService } from '../services/websocket'
import { useMonitoringStore } from '../stores/monitoring'

interface WebSocketData {
  status?: string
  [key: string]: unknown
}

interface WebSocketConnectedData {
  equipmentName: string
}

interface WebSocketDisconnectedData {
  event: CloseEvent
  equipmentName: string
}

interface WebSocketErrorData {
  error: Event | Error
}

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
  currentDeviceParams: Ref<Record<string, string> | null>,
  onFaultDetected?: () => Promise<void>
) {
  // 获取全局监控状态管理
  const monitoringStore = useMonitoringStore()
  
  // 标记是否为模拟故障状态
  const isSimulatedFault = ref(false)
  // 监控状态
  const isMonitoring = ref(false)
  const wsService = createWebSocketService()
  
  // 防抖相关状态
  const isRefreshing = ref(false)
  const lastRefreshTime = ref(0)
  
  // 监控统计
  const monitoringStats = ref({
    lastCheckTime: '',
    totalChecks: 0,
    consecutiveFaults: 0,
    consecutiveRunning: 0,
    connectionStatus: '未连接'
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

  // 处理WebSocket消息
  const handleWebSocketMessage = (data: WebSocketData) => {
    if (!isDeviceBound.value || !boundDeviceInfo.value) {
      return
    }

    // 检查是否为13#或14#设备，这些设备不处理真实数据
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
      console.log(`[设备监控] ${equipmentName.value} 当前为模拟故障状态，跳过WebSocket状态更新`)
      return
    }

    // 从WebSocket消息中获取设备状态信息
    const status = data.status || '未知状态'
    
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
        
        // 创建全局故障警告
        monitoringStore.createFaultAlert(currentFaultName)
        
        ElMessage.error(`设备发生故障: ${currentFaultName}`)
        
        // 触发AI分析
        if (onFaultDetected) {
          try {
            onFaultDetected()
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
        
        // 更新全局故障警告 - 重新创建故障警告以更新故障名称
        monitoringStore.createFaultAlert(currentFaultName)
        
        ElMessage.warning(`故障类型变更: ${currentFaultName}`)
        
        // 重新触发AI分析
        if (onFaultDetected) {
          try {
            onFaultDetected()
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
        
        // 关闭全局故障警告
        monitoringStore.removeFaultAlerts()
        
        ElMessage.success('设备已恢复正常运行')
      } else if (deviceStatus.value === 'stopped') {
        // 从停机状态变为运行状态
        deviceStatus.value = 'running'
        
        // 更新设备参数
        updateDeviceParams()
        
        localStorage.setItem('deviceStatus', deviceStatus.value)
      }
    }
  }

  // 处理WebSocket连接事件
  const handleWebSocketConnected = (data: WebSocketConnectedData) => {
    console.log(`[设备监控] WebSocket连接成功: ${data.equipmentName}`)
    monitoringStats.value.connectionStatus = '已连接'
    ElMessage.success('实时监控连接成功')
  }

  // 处理WebSocket断开事件
  const handleWebSocketDisconnected = (data: WebSocketDisconnectedData) => {
    console.log(`[设备监控] WebSocket连接断开: ${data.equipmentName}`)
    monitoringStats.value.connectionStatus = '连接断开'
    ElMessage.warning('实时监控连接断开，正在尝试重连...')
  }

  // 处理WebSocket错误事件
  const handleWebSocketError = (data: WebSocketErrorData) => {
    console.error('[设备监控] WebSocket错误:', data.error)
    monitoringStats.value.connectionStatus = '连接错误'
    ElMessage.error('实时监控连接错误')
  }

  // 开始监控
  const startMonitoring = async () => {
    if (isMonitoring.value || !isDeviceBound.value || !boundDeviceInfo.value) {
      return
    }
    
    console.log(`[设备监控] 开始监控设备: ${equipmentName.value}`)
    
    // 重置统计
    monitoringStats.value = {
      lastCheckTime: '',
      totalChecks: 0,
      consecutiveFaults: 0,
      consecutiveRunning: 0,
      connectionStatus: '连接中...'
    }
    
    // 确保先清理之前的事件监听器，避免重复绑定
    wsService.off('message', handleWebSocketMessage)
    wsService.off('connected', handleWebSocketConnected)
    wsService.off('disconnected', handleWebSocketDisconnected)
    wsService.off('error', handleWebSocketError)
    
    // 重新设置WebSocket事件监听器
    wsService.on('message', handleWebSocketMessage)
    wsService.on('connected', handleWebSocketConnected)
    wsService.on('disconnected', handleWebSocketDisconnected)
    wsService.on('error', handleWebSocketError)
    
    try {
      // 连接WebSocket
      await wsService.connect(equipmentName.value)
      isMonitoring.value = true
      
      // 更新全局监控状态
      monitoringStore.setMonitoringStatus(true)
      monitoringStore.setDeviceBinding(true, {
        type: boundDeviceInfo.value.type,
        number: boundDeviceInfo.value.number.toString(),
        shift: boundDeviceInfo.value.shift
      }, equipmentName.value)
      
      console.log(`[设备监控] 设备 ${equipmentName.value} 监控已启动`)
    } catch (error) {
      console.error('[设备监控] WebSocket连接失败:', error)
      ElMessage.error('实时监控连接失败')
      monitoringStats.value.connectionStatus = '连接失败'
      
      // 连接失败时清理事件监听器
      wsService.off('message', handleWebSocketMessage)
      wsService.off('connected', handleWebSocketConnected)
      wsService.off('disconnected', handleWebSocketDisconnected)
      wsService.off('error', handleWebSocketError)
    }
  }

  // 停止监控
  const stopMonitoring = () => {
    if (!isMonitoring.value) {
      return
    }
    
    console.log('[设备监控] 停止监控')
    
    isMonitoring.value = false
    
    // 更新全局监控状态
    monitoringStore.setMonitoringStatus(false)
    
    // 移除WebSocket事件监听器
    wsService.off('message', handleWebSocketMessage)
    wsService.off('connected', handleWebSocketConnected)
    wsService.off('disconnected', handleWebSocketDisconnected)
    wsService.off('error', handleWebSocketError)
    
    // 断开WebSocket连接
    wsService.disconnect()
    
    // 重置设备状态
    if (deviceStatus.value === 'fault') {
      deviceStatus.value = 'stopped'
      faultName.value = ''
      
      // 更新设备参数
      updateDeviceParams()
      
      // 保存状态到localStorage
      localStorage.setItem('deviceStatus', deviceStatus.value)
      localStorage.setItem('faultName', faultName.value)
    }
    
    monitoringStats.value.connectionStatus = '未连接'
    ElMessage.info('已停止设备状态监控')
  }

  // 手动刷新状态（带防抖机制）
  const refreshStatus = async () => {
    if (!isDeviceBound.value) {
      ElMessage.warning('请先绑定设备')
      return
    }
    
    // 防抖检查：3秒内只允许一次刷新操作
    const now = Date.now()
    const debounceTime = 3000 // 3秒防抖
    
    if (isRefreshing.value) {
      ElMessage.warning('正在刷新中，请稍候...')
      return
    }
    
    if (now - lastRefreshTime.value < debounceTime) {
      const remaining = Math.ceil((debounceTime - (now - lastRefreshTime.value)) / 1000)
      ElMessage.warning(`请等待 ${remaining} 秒后再试`)
      return
    }
    
    isRefreshing.value = true
    lastRefreshTime.value = now
    
    try {
      if (!isMonitoring.value) {
        // 如果没有在监控，则启动监控
        await startMonitoring()
      } else {
        // 如果已经在监控，则安全地重新连接WebSocket
        console.log('[设备监控] 开始安全重连...')
        await safeReconnect()
      }
      
      ElMessage.success('设备状态已刷新')
    } catch (error) {
      console.error('[设备监控] 刷新失败:', error)
      ElMessage.error('刷新失败，请稍后再试')
    } finally {
      // 延迟重置刷新状态，避免用户过快再次点击
      setTimeout(() => {
        isRefreshing.value = false
      }, 1000)
    }
  }

  // 安全重连WebSocket
  const safeReconnect = async () => {
    // 标记为手动重连，避免自动重连干扰
    const originalAllowReconnect = wsService.reconnectAllowed
    
    try {
      // 临时禁用自动重连
      wsService.reconnectAllowed = false
      
      // 先移除所有事件监听器
      wsService.off('message', handleWebSocketMessage)
      wsService.off('connected', handleWebSocketConnected)  
      wsService.off('disconnected', handleWebSocketDisconnected)
      wsService.off('error', handleWebSocketError)
      
      // 强制断开连接
      wsService.disconnect()
      
      // 重置监控状态
      isMonitoring.value = false
      monitoringStats.value.connectionStatus = '重连中...'
      
      // 等待足够时间确保连接完全断开
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('[设备监控] 开始重新建立连接...')
      
      // 重新开始监控
      await startMonitoring()
      
    } catch (error) {
      console.error('[设备监控] 安全重连失败:', error)
      ElMessage.error('重连失败，请稍后再试')
      
      // 恢复原始的重连设置
      wsService.reconnectAllowed = originalAllowReconnect
      
      // 确保监控状态正确
      isMonitoring.value = false
      monitoringStats.value.connectionStatus = '连接失败'
      
      throw error
    }
  }

  // 监听设备绑定状态变化
  watch(isDeviceBound, (newValue) => {
    if (newValue) {
      // 设备绑定后自动开始监控
      setTimeout(() => {
        startMonitoring()
      }, 1000) // 延迟1秒开始监控
    } else {
      // 只在用户主动解绑设备时停止监控，而不是在组件卸载时
      // 这样可以确保在切换模块时监控继续运行
      if (boundDeviceInfo.value) {
        // 设备信息存在，说明是组件卸载导致的isDeviceBound变化，不停止监控
        console.log('[设备监控] 检测到组件卸载，保持监控运行')
      } else {
        // 设备信息不存在，说明是用户主动解绑设备，停止监控
        stopMonitoring()
      }
    }
  }, { immediate: true })

  // 组件卸载时清理 - 不再停止监控，以支持后台监控
  onUnmounted(() => {
    // 移除WebSocket事件监听器，但不断开连接
    wsService.off('message', handleWebSocketMessage)
    wsService.off('connected', handleWebSocketConnected)
    wsService.off('disconnected', handleWebSocketDisconnected)
    wsService.off('error', handleWebSocketError)
    
    console.log('[设备监控] 组件卸载，保持监控运行以支持后台监控')
  })

  // 设置模拟故障状态
  const setSimulatedFault = (simulated: boolean) => {
    isSimulatedFault.value = simulated
    console.log(`[设备监控] 模拟故障状态: ${simulated ? '开启' : '关闭'}`)
  }

  return {
    isMonitoring,
    monitoringStats,
    equipmentName,
    startMonitoring,
    stopMonitoring,
    refreshStatus,
    setSimulatedFault,
    updateDeviceParams,
    isRefreshing
  }
}
