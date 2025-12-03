import { api } from '../utils/httpClient'

export interface FaultQueryParams {
  start_date?: string
  end_date?: string
  class_group?: string
  class_shift?: string
  mch_name?: string
  fault_name?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: string
}

export interface FaultRecord {
  mch_name: string
  fault_time: string
  stop_time: string
  fault_name: string
  mch_params: Record<string, any>
  ai_analysis: string
  class_group: string
  class_shift: string
}

export type FaultQueryResponse = FaultRecord[]

export interface FaultInsertRequest {
  mch_name: string
  fault_time: string
  stop_time: string
  fault_name: string
  mch_params?: Record<string, any>
  ai_analysis?: string
  class_group: string
  class_shift: string
}

export interface FaultInsertResponse {
  message: string
  id?: number
}

export const faultService = {
  // 查询历史故障记录
  async queryFaultHistory(params: FaultQueryParams): Promise<FaultQueryResponse> {
    try {
      const data = await api.post<FaultQueryResponse>('/api/fault/query_fault_history', params)
      return data
    } catch (error) {
      console.error('查询故障记录失败:', error)
      throw new Error('查询故障记录失败')
    }
  },

  // 插入故障信息
  async insertFaultInfo(faultData: FaultInsertRequest): Promise<FaultInsertResponse> {
    try {
      const data = await api.post<FaultInsertResponse>('/api/fault/insert_fault_info', faultData)
      return data
    } catch (error) {
      console.error('插入故障信息失败:', error)
      throw new Error('插入故障信息失败')
    }
  }
}