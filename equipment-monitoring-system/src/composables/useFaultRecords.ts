import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { faultService } from '../services/fault'

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

interface HistoryFilters {
  dateRange: [Date, Date] | null
  class_group: string
  mch_name: string
}

export function useFaultRecords(requireAuth: (callback: () => void) => void) {
  // 故障记录相关状态
  const faultDashboardTab = ref('data-dashboard') // 'data-dashboard', 'history-records'
  
  // 历史记录过滤器
  const historyFilters = reactive<HistoryFilters>({
    dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
    class_group: '',
    mch_name: ''
  })

  // 故障记录数据
  const alarmHistoryRecords = ref<AlarmRecord[]>([])
  const isLoadingFaultRecords = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalRecords = ref(0)

  // 故障记录详情弹窗
  const showFaultDetailDialog = ref(false)
  const selectedFaultRecord = ref<AlarmRecord | null>(null)

  // 过滤后的历史记录
  const filteredHistoryRecords = computed(() => {
    return alarmHistoryRecords.value
  })

  // 格式化时间显示
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return ''
    // 移除时区信息，只保留年月日时分秒
    return dateTimeStr.replace('T', ' ').substring(0, 19)
  }

  // 查询历史故障记录
  const queryFaultHistory = async () => {
    requireAuth(async () => {
      isLoadingFaultRecords.value = true
      try {
        const params = {
          start_date: historyFilters.dateRange?.[0] ? historyFilters.dateRange[0].toISOString().split('T')[0] : undefined,
          end_date: historyFilters.dateRange?.[1] ? historyFilters.dateRange[1].toISOString().split('T')[0] : undefined,
          class_group: historyFilters.class_group || undefined,
          mch_name: historyFilters.mch_name || undefined,
          page: currentPage.value,
          page_size: pageSize.value,
          sort_by: 'fault_time',
          sort_order: 'desc'
        }
        
        const result = await faultService.queryFaultHistory(params)
        // 后端直接返回数组，需要转换为前端需要的格式
        alarmHistoryRecords.value = result.map((record, index) => ({
          id: index + 1, // 临时生成id
          ...record
        })) || []
        totalRecords.value = result.length || 0
        ElMessage.success('查询成功')
      } catch (error: any) {
        ElMessage.error('查询失败：' + (error.message || '未知错误'))
      } finally {
        isLoadingFaultRecords.value = false
      }
    })
  }

  // 打开故障记录详情弹窗
  const openFaultDetail = (record: AlarmRecord) => {
    selectedFaultRecord.value = record
    showFaultDetailDialog.value = true
  }

  // 关闭故障记录详情弹窗
  const closeFaultDetail = () => {
    showFaultDetailDialog.value = false
    selectedFaultRecord.value = null
  }

  return {
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
    closeFaultDetail
  }
}
