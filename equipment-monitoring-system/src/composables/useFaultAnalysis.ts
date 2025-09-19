import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { requestDifyAnalysis, generateMachineName, type DifyAnalysisRequest } from '../services/difyAnalysis'
import { useMonitoringStore } from '../stores/monitoring'

interface BoundDeviceInfo {
  type: string
  number: string | number
  shift: string
  id: string
}

export function useFaultAnalysis(
  requireAuth: (callback: () => void) => void,
  boundDeviceInfo: Ref<BoundDeviceInfo | null>,
  faultName: Ref<string>,
  deviceStatus: Ref<'running' | 'stopped' | 'fault'>
) {
  // 获取全局监控状态管理
  const monitoringStore = useMonitoringStore()
  
  // AI分析相关状态
  const faultAnalysis = ref('')
  const analysisLoading = ref(false)
  const isStreaming = ref(false)
  const streamingProgress = ref(0)

  // 分析故障
  const analyzeFault = async () => {
    requireAuth(async () => {
      if (deviceStatus.value !== 'fault') {
        ElMessage.warning('当前设备无故障，无需分析')
        return
      }
      
      // 检查是否已有分析结果
      const existingAnalysis = monitoringStore.currentFaultAlert?.aiAnalysis
      if (existingAnalysis && existingAnalysis.trim() && !faultAnalysis.value) {
        // 如果已有分析结果且当前没有显示分析结果，则直接显示
        faultAnalysis.value = existingAnalysis
        ElMessage.info('已加载之前的AI分析结果')
        
        // 如果正在流式响应，则不需要重新开始分析
        if (isStreaming.value) {
          return
        }
      }
      
      console.log('开始故障分析...')
      analysisLoading.value = true
      isStreaming.value = false
      streamingProgress.value = 0
      
      // 只有在没有分析结果或用户明确要求重新分析时才清空之前的结果
      if (!existingAnalysis || !existingAnalysis.trim()) {
        faultAnalysis.value = '' // 清除之前的结果
      }

      try {
        const machineName = generateMachineName(boundDeviceInfo.value)
        const request: DifyAnalysisRequest = {
          faultName: faultName.value,
          machineName: machineName
        }

        console.log('发起分析请求:', request)
        
        let messageCount = 0
        
        await requestDifyAnalysis(
          request,
          (response) => {
            // 流式接收AI分析内容
            if (!isStreaming.value) {
              isStreaming.value = true
              ElMessage.info('开始接收AI分析结果...')
            }
            
            messageCount++
            streamingProgress.value = messageCount
            
            // 确保内容是字符串类型
            const content = typeof response.content === 'string' ? response.content : String(response.content || '')
            
            console.log(`接收第${messageCount}条消息:`, content)
            
            // 只添加非空内容
            if (content.trim()) {
              faultAnalysis.value += content
              
              // 广播流式分析结果到全局，使弹窗也能实时更新
              window.dispatchEvent(new CustomEvent('fault-analysis-streaming', {
                detail: {
                  content: faultAnalysis.value,
                  isComplete: response.isComplete,
                  messageCount: messageCount
                }
              }))
            }
            
            // 如果是第一条消息，显示成功提示
            if (messageCount === 1) {
              analysisLoading.value = false // 停止加载动画，开始显示内容
            }
          },
          () => {
            // 分析完成
            console.log('分析完成，总共接收', messageCount, '条消息')
            isStreaming.value = false
            ElMessage.success(`AI分析完成（接收${messageCount}条消息）`)
            
            // 广播分析完成事件
            window.dispatchEvent(new CustomEvent('fault-analysis-streaming', {
              detail: {
                content: faultAnalysis.value,
                isComplete: true,
                messageCount: messageCount
              }
            }))
            
            // 更新全局故障警告的AI分析结果
            if (monitoringStore.currentFaultAlert) {
              monitoringStore.updateFaultAlertAnalysis(monitoringStore.currentFaultAlert.id, faultAnalysis.value)
            }
          },
          (error) => {
            // 分析出错
            console.error('AI分析错误:', error)
            ElMessage.error(`AI分析失败: ${error}`)
            isStreaming.value = false
            
            if (faultAnalysis.value.trim() === '') {
              faultAnalysis.value = `**分析失败**: ${error}\n\n请检查网络连接或联系管理员。`
            }
            
            // 广播分析错误事件
            window.dispatchEvent(new CustomEvent('fault-analysis-streaming', {
              detail: {
                content: faultAnalysis.value,
                isComplete: true,
                messageCount: messageCount
              }
            }))
            
            // 更新全局故障警告的AI分析结果（失败信息）
            if (monitoringStore.currentFaultAlert) {
              monitoringStore.updateFaultAlertAnalysis(monitoringStore.currentFaultAlert.id, faultAnalysis.value)
            }
          }
        )
      } catch (error) {
        console.error('故障分析错误:', error)
        ElMessage.error('AI分析失败')
        isStreaming.value = false
        faultAnalysis.value = `**分析失败**: ${error instanceof Error ? error.message : '未知错误'}\n\n请检查网络连接或联系管理员。`
      } finally {
        analysisLoading.value = false
      }
    })
  }

  return {
    faultAnalysis,
    analysisLoading,
    isStreaming,
    streamingProgress,
    analyzeFault
  }
}
