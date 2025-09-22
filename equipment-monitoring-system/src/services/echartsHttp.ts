// ECharts数据HTTP服务
import axios from 'axios'

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
  start_date?: string
  end_date?: string
  class_group?: string
}

export class EChartsHttpService {
  private baseUrl: string = 'http://127.0.0.1:8000'

  // 获取ECharts数据
  async getEChartsData(params: EChartsPostParams): Promise<EChartsPostData> {
    try {
      // 将卷烟机替换为卷接机
      let equipmentName = params.equ_name
      if (equipmentName.includes('卷烟机')) {
        equipmentName = equipmentName.replace('卷烟机', '卷接机')
      }

      const url = `${this.baseUrl}/api/echarts`
      
      // 构建请求体，只包含非空参数
      const requestBody: any = {
        equ_name: equipmentName
      }
      
      // 只添加非空的可选参数
      if (params.start_date) {
        requestBody.start_date = params.start_date
      }
      if (params.end_date) {
        requestBody.end_date = params.end_date
      }
      if (params.class_group) {
        requestBody.class_group = params.class_group
      }
      
      const response = await axios.post(url, requestBody)
      return response.data
    } catch (error) {
      console.error('[ECharts HTTP] 获取数据失败:', error)
      throw error
    }
  }
}

// 创建单例实例
export const createEChartsHttpService = (baseUrl: string = 'http://127.0.0.1:8000') => {
  return new EChartsHttpService()
}