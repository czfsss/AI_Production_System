// API配置文件
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  endpoints: {
    login: '/api/user/login',
    register: '/api/user/register',
    getUserInfo: '/api/user/get_userInfo',
    faultHistory: '/api/fault/query_fault_history',
    equipmentStatus: '/api/equ/equbending'
  }
}

// 获取完整的API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseURL}${endpoint}`
}