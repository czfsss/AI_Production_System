import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRealTimeMonitoring } from './useRealTimeMonitoring'

interface DeviceOption {
  label: string
  value: string | number
}

interface BoundDeviceInfo {
  type: string
  number: string | number
  shift: string
  id: string
}

interface DeviceParams {
  temperature: string
  pressure: string
  speed: number
  runtime: string
  humidity: string
  vibration: string
  current: string
  voltage: string
  power: string
  flow: string
  oilTemp: string
  oilPressure: string
  throughput: string
  energy: string
  efficiency: string
}

export function useDeviceBinding(
  requireAuth: (callback: () => void) => void,
  onFaultDetected?: () => Promise<void>
) {
  // 从localStorage恢复状态
  const savedBoundDeviceInfo = localStorage.getItem('boundDeviceInfo')
  const savedCurrentDeviceParams = localStorage.getItem('currentDeviceParams')
  const savedDeviceStatus = localStorage.getItem('deviceStatus')
  const savedFaultName = localStorage.getItem('faultName')
  
  // 设备绑定相关状态
  const deviceType = ref('')
  const deviceNumber = ref('')
  const shift = ref('')
  const isDeviceBound = ref(!!savedBoundDeviceInfo)

  // 设备选项
  const deviceTypes: DeviceOption[] = [
    { label: '卷烟机', value: 'cigarette_machine' },
    { label: '包装机', value: 'packing_machine' }
  ]
  
  const deviceNumbers: DeviceOption[] = Array.from({ length: 22 }, (_, i) => ({ 
    label: `${i + 1}#`, 
    value: i + 1 
  }))
  
  const shifts: DeviceOption[] = [
    { label: '甲班', value: 'jia' },
    { label: '乙班', value: 'yi' },
    { label: '丙班', value: 'bing' }
  ]

  // 设备数据
  const boundDeviceInfo = ref<BoundDeviceInfo | null>(savedBoundDeviceInfo ? JSON.parse(savedBoundDeviceInfo) : null)
  const currentDeviceParams = ref<DeviceParams | null>(savedCurrentDeviceParams ? JSON.parse(savedCurrentDeviceParams) : null)
  const deviceStatus = ref<'running' | 'stopped' | 'fault'>((savedDeviceStatus as 'running' | 'stopped' | 'fault') || 'stopped')
  const faultName = ref(savedFaultName || '')

  // 初始化实时监控
  const {
    isMonitoring,
    currentInterval,
    monitoringStats,
    equipmentName,
    startMonitoring,
    stopMonitoring,
    refreshStatus,
    checkDeviceStatus,
    setSimulatedFault
  } = useRealTimeMonitoring(
    isDeviceBound,
    boundDeviceInfo,
    deviceStatus,
    faultName,
    onFaultDetected
  )

  // 绑定设备
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
      
      // 初始化设备状态为停机，等待实时监控更新
      deviceStatus.value = 'stopped'
      currentDeviceParams.value = {
        temperature: '0.0',
        pressure: '0.0',
        speed: 0,
        runtime: '0h 0m',
        humidity: '0.0',
        vibration: '0.00',
        current: '0.0',
        voltage: '0',
        power: '0.0',
        flow: '0.0',
        oilTemp: '0.0',
        oilPressure: '0.0',
        throughput: '0',
        energy: '0.0',
        efficiency: '0.0'
      }
      
      isDeviceBound.value = true
      
      // 保存状态到localStorage
      localStorage.setItem('boundDeviceInfo', JSON.stringify(boundDeviceInfo.value))
      localStorage.setItem('currentDeviceParams', JSON.stringify(currentDeviceParams.value))
      localStorage.setItem('deviceStatus', deviceStatus.value)
      localStorage.setItem('faultName', faultName.value)
      
      ElMessage.success('设备绑定成功，即将开始实时监控')
    })
  }

  // 解绑设备
  const unbindDevice = () => {
    requireAuth(() => {
      ElMessageBox.confirm('确定要解绑当前设备吗？解绑后将停止实时监控。', '解绑确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'unbind-confirm'
      })
      .then(() => {
        // 停止监控
        stopMonitoring()
        
        isDeviceBound.value = false
        boundDeviceInfo.value = null
        currentDeviceParams.value = null
        deviceStatus.value = 'stopped'
        faultName.value = ''
        
        // 清除localStorage中的设备状态
        localStorage.removeItem('boundDeviceInfo')
        localStorage.removeItem('currentDeviceParams')
        localStorage.removeItem('deviceStatus')
        localStorage.removeItem('faultName')
        
        ElMessage.info('设备已解绑，实时监控已停止')
      })
      .catch(() => {
        ElMessage.info('已取消解绑')
      })
    })
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      running: '运行中',
      stopped: '已停机',
      fault: '故障'
    }
    return statusMap[status] || status
  }

  // 获取状态样式类
  const getStatusClass = (status: string) => {
    return `status-${status}`
  }

  // 模拟设备故障（用于演示）
  const simulateDeviceFault = async () => {
    requireAuth(async () => {
      if (deviceStatus.value === 'running') {
        deviceStatus.value = 'fault'
        faultName.value = '模拟故障：传感器读数异常'
        // 设置模拟故障状态，防止实时监控覆盖
        setSimulatedFault(true)
        // 更新localStorage
        localStorage.setItem('deviceStatus', deviceStatus.value)
        localStorage.setItem('faultName', faultName.value)
        ElMessage.error(`设备发生故障: ${faultName.value}`)
        
        // 自动触发AI分析
        if (onFaultDetected) {
          try {
            await onFaultDetected()
          } catch (error) {
            console.warn('自动故障分析失败:', error)
          }
        }
      } else if (deviceStatus.value === 'fault') {
        deviceStatus.value = 'running'
        faultName.value = ''
        // 取消模拟故障状态，恢复实时监控
        setSimulatedFault(false)
        // 更新localStorage
        localStorage.setItem('deviceStatus', deviceStatus.value)
        localStorage.setItem('faultName', faultName.value)
        ElMessage.success('设备已恢复正常')
      }
    })
  }

  return {
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
    getStatusClass,
    // 实时监控相关
    isMonitoring,
    currentInterval,
    monitoringStats,
    equipmentName,
    startMonitoring,
    stopMonitoring,
    refreshStatus,
    checkDeviceStatus,
    simulateDeviceFault
  }
}
