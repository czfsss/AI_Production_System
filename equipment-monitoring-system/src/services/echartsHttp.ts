// ECharts数据HTTP服务
import { api } from '../utils/httpClient'
import { API_CONFIG } from '../config/api'

export interface EChartsPostData {
  fault_counts: Array<{
    日期: string
    班组: string
    停机次数: number
  }>
  production: Array<{
    日期: string
    班组名称: string
    '产量(箱)': number
  }>
  bad_somke: Array<{
    日期: string
    班组: string
    '坏烟数量(公斤)': number
    '坏烟单耗(公斤/箱)': number
  }>
}

export interface EChartsPostParams {
  equ_name: string
  start_time?: string
  end_time?: string
  class_group?: string
}

export class EChartsHttpService {
  // 获取ECharts数据
  async getEChartsData(params: EChartsPostParams): Promise<EChartsPostData> {
    try {
      // 将卷烟机替换为卷接机
      let equipmentName = params.equ_name
      if (equipmentName.includes('卷烟机')) {
        equipmentName = equipmentName.replace('卷烟机', '卷接机')
      }

      // 构建请求体，只包含非空参数
      const requestBody: Record<string, string> = {
        equ_name: equipmentName
      }
      
      // 只添加非空的可选参数
      if (params.start_time) {
        requestBody.start_time = params.start_time
      }
      if (params.end_time) {
        requestBody.end_time = params.end_time
      }
      if (params.class_group) {
        requestBody.class_group = params.class_group
      }
      
      const response = await api.post(API_CONFIG.endpoints.echarts, requestBody)
      const data = await response.json()
      return data as EChartsPostData
    } catch (error) {
      console.error('[ECharts HTTP] 获取数据失败:', error)
      throw error
    }
  }
}

// 创建单例实例
export const createEChartsHttpService = () => {
  return new EChartsHttpService()
}