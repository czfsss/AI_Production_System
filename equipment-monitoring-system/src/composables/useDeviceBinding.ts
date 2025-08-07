import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface DeviceOption {
  label: string
  value: string | number
}

export function useDeviceBinding(requireAuth: (callback: () => void) => void) {
  // 设备绑定相关状态
  const deviceType = ref('')
  const deviceNumber = ref('')
  const shift = ref('')
  const isDeviceBound = ref(false)

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
  const boundDeviceInfo = ref<any>(null)
  const currentDeviceParams = ref<any>(null)
  const deviceStatus = ref<'running' | 'stopped' | 'fault'>('stopped')
  const faultName = ref('')

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
        runtime: '0h 5m'
      }
      
      isDeviceBound.value = true
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
  const simulateDeviceFault = () => {
    requireAuth(() => {
      if (deviceStatus.value === 'running') {
        deviceStatus.value = 'fault'
        faultName.value = '传感器通讯中断'
        ElMessage.error(`设备发生故障: ${faultName.value}`)
      } else if (deviceStatus.value === 'fault') {
        deviceStatus.value = 'running'
        faultName.value = ''
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
