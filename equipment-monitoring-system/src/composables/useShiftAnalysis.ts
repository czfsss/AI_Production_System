import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useShiftAnalysis(
  requireAuth: (callback: () => void) => void,
  boundDeviceInfo: any
) {
  // 班次分析相关状态
  const isAnalyzingShift = ref(false)
  const shiftAnalysisResult = ref('')
  const showAnalysisResult = ref(false)

  // 执行班次分析
  const performShiftAnalysis = async () => {
    requireAuth(async () => {
      isAnalyzingShift.value = true
      showAnalysisResult.value = false
      shiftAnalysisResult.value = ''

      try {
        // 模拟AI分析
        await new Promise(resolve => setTimeout(resolve, 5000))
        shiftAnalysisResult.value = `
## 本班次生产分析报告

### 班次概览
- **班次**: ${boundDeviceInfo.value?.shift || 'N/A'}
- **分析时间**: ${new Date().toLocaleString()}

### 运行总结
本班次设备整体运行平稳，共发生一次 minor 故障，已快速处理，未对生产造成重大影响。设备平均运行参数在正常范围内。

### 关键指标
- **总运行时间**: 7h 45m
- **平均温度**: 62.5°C
- **平均压力**: 1.8 MPa
- **平均转速**: 1180 rpm
- **故障次数**: 1次 (传感器通讯中断)

### 故障分析
本次发生的"传感器通讯中断"故障，原因为线路瞬时接触不良。建议在后续维护中重点关注此类连接点的稳定性。

### 优化建议
1. **预防性维护**: 建议增加对关键传感器连接点的检查频率。
2. **操作培训**: 加强操作人员对设备初期故障现象的识别能力。
3. **备件管理**: 确保常用传感器和通讯模块有充足备件。
`
        ElMessage.success('本班分析完成')
      } catch (error) {
        ElMessage.error('本班分析失败')
      } finally {
        isAnalyzingShift.value = false
        showAnalysisResult.value = true
      }
    })
  }

  // 关闭班次分析结果
  const closeShiftAnalysisResult = () => {
    showAnalysisResult.value = false
    shiftAnalysisResult.value = ''
    isAnalyzingShift.value = false
  }

  return {
    isAnalyzingShift,
    shiftAnalysisResult,
    showAnalysisResult,
    performShiftAnalysis,
    closeShiftAnalysisResult
  }
}
