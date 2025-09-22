// API配置文件
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  endpoints: {
    login: '/api/user/login',
    register: '/api/user/register',
    getUserInfo: '/api/user/get_userInfo',
    faultHistory: '/api/fault/query_fault_history',
    equipmentStatus: '/api/equ/equbending',
    echarts: '/api/echarts',
    wsEcharts: '/api/ws/echarts',
    wsEquipment: '/api/ws/equipment'
  }
}

// 获取WebSocket基础URL（将http/https转换为ws/wss）
export function getWebSocketBaseUrl(): string {
  const baseUrl = API_CONFIG.baseURL
  if (baseUrl.startsWith('https://')) {
    return baseUrl.replace('https://', 'wss://')
  } else if (baseUrl.startsWith('http://')) {
    return baseUrl.replace('http://', 'ws://')
  }
  // 如果没有协议前缀，默认使用ws://
  return `ws://${baseUrl}`
}

// 获取完整的API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseURL}${endpoint}`
}

// 获取完整的WebSocket URL
export function getWebSocketUrl(endpoint: string): string {
  return `${getWebSocketBaseUrl()}${endpoint}`
}