import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

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

export interface FaultQueryResponse {
  records: FaultRecord[]
  total: number
}

export const faultService = {
  // 查询历史故障记录
  async queryFaultHistory(params: FaultQueryParams): Promise<FaultQueryResponse> {
    try {
      const response = await api.post<FaultQueryResponse>('/api/fault/query_fault_history', params)
      return response.data
    } catch (error) {
      console.error('查询故障记录失败:', error)
      throw new Error('查询故障记录失败')
    }
  }
}