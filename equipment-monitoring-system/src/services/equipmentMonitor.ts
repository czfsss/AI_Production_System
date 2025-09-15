import axios from 'axios'
import { API_CONFIG } from '../config/api'

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface EquipmentStatusRequest {
  equ_name: string
}

export interface EquipmentStatusResponse {
  equipment_status: string
}

/**
 * 将前端设备信息转换为后端point_map格式的设备名称
 */
export function formatEquipmentName(type: string, number: string | number): string {
  // 将前端的设备类型映射到后端格式
  const typeMap: Record<string, string> = {
    '卷接机': '卷烟机',
    '包装机': '包装机',
    '封箱机': '包装机' // 封箱机暂时映射到包装机
  }
  
  const backendType = typeMap[type] || type
  
  // 格式化设备编号，确保两位数字格式
  const formattedNumber = String(number).padStart(2, '0')
  
  return `${formattedNumber}#${backendType}`
}

/**
 * 查询设备状态
 */
export async function queryEquipmentStatus(equipmentName: string): Promise<EquipmentStatusResponse> {
  try {
    const response = await api.post<EquipmentStatusResponse>(
      API_CONFIG.endpoints.equipmentStatus,
      { equ_name: equipmentName }
    )
    return response.data
  } catch (error) {
    console.error('查询设备状态失败:', error)
    throw new Error('查询设备状态失败')
  }
}

/**
 * 判断设备是否处于故障状态
 */
export function isEquipmentFaulty(status: string): boolean {
  return status !== '运行'
}

/**
 * 提取故障名称
 */
export function extractFaultName(status: string): string {
  // 如果状态不是"运行"，则认为是故障信息
  if (status === '运行') {
    return ''
  }
  
  // 处理包装机的故障格式："主机故障：故障名" 或 "辅机故障：故障名"
  const faultPattern = /(?:主机故障|辅机故障)：(.+)/
  const match = status.match(faultPattern)
  if (match) {
    return match[1]
  }
  
  // 对于卷烟机或其他设备，直接返回状态作为故障名
  return status
}