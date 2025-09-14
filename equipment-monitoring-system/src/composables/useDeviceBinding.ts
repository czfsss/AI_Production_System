import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRandomFaultName } from '../data/faultNames'

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

export function useDeviceBinding(requireAuth: (callback: () => void) => void) {
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
    { label: '卷接机', value: 'cigarette_machine' },
    { label: '包装机', value: 'packing_machine' },
    { label: '封箱机', value: 'cartoning_machine' }
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
      
      // 模拟获取初始设备状态和参数
      deviceStatus.value = 'running'
      currentDeviceParams.value = {
        temperature: (Math.random() * 30 + 50).toFixed(1),
        pressure: (Math.random() * 2 + 1).toFixed(1),
        speed: Math.floor(Math.random() * 500 + 1000),
        runtime: '0h 5m',
        humidity: (Math.random() * 20 + 45).toFixed(1),
        vibration: (Math.random() * 2 + 0.5).toFixed(2),
        current: (Math.random() * 5 + 10).toFixed(1),
        voltage: (Math.random() * 20 + 380).toFixed(0),
        power: (Math.random() * 10 + 25).toFixed(1),
        flow: (Math.random() * 5 + 15).toFixed(1),
        oilTemp: (Math.random() * 15 + 35).toFixed(1),
        oilPressure: (Math.random() * 1 + 2.5).toFixed(1),
        throughput: Math.floor(Math.random() * 200 + 800),
        energy: (Math.random() * 50 + 100).toFixed(1),
        efficiency: (Math.random() * 10 + 85).toFixed(1)
      }
      
      isDeviceBound.value = true
      
      // 保存状态到localStorage
      localStorage.setItem('boundDeviceInfo', JSON.stringify(boundDeviceInfo.value))
      localStorage.setItem('currentDeviceParams', JSON.stringify(currentDeviceParams.value))
      localStorage.setItem('deviceStatus', deviceStatus.value)
      localStorage.setItem('faultName', faultName.value)
      
      ElMessage.success('设备绑定成功')
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
        isDeviceBound.value = false
        boundDeviceInfo.value = null
        currentDeviceParams.value = null
        deviceStatus.value = 'stopped'
        
        // 清除localStorage中的设备状态
        localStorage.removeItem('boundDeviceInfo')
        localStorage.removeItem('currentDeviceParams')
        localStorage.removeItem('deviceStatus')
        localStorage.removeItem('faultName')
        
        ElMessage.info('设备已解绑')
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

  // 模拟设备故障
  const simulateDeviceFault = (autoAnalyze: () => Promise<void> = async () => {}) => {
    requireAuth(async () => {
      if (deviceStatus.value === 'running') {
        deviceStatus.value = 'fault'
        faultName.value = getRandomFaultName() // 使用随机故障名称
        // 更新localStorage
        localStorage.setItem('deviceStatus', deviceStatus.value)
        localStorage.setItem('faultName', faultName.value)
        ElMessage.error(`设备发生故障: ${faultName.value}`)
        
        // 自动触发AI分析
        try {
          await autoAnalyze()
        } catch (error) {
          console.warn('自动故障分析失败:', error)
        }
      } else if (deviceStatus.value === 'fault') {
        deviceStatus.value = 'running'
        faultName.value = ''
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
    simulateDeviceFault
  }
}
