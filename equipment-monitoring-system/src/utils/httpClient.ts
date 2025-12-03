/**
 * HTTP客户端工具 - 自动处理JWT认证和令牌刷新
 */

import { useAuthStore } from '../stores/auth'
import { API_CONFIG } from '../config/api'

class HttpClient {
  private baseURL: string
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })
    
    this.failedQueue = []
  }

  private async refreshToken(): Promise<string | null> {
    const authStore = useAuthStore()
    
    if (!authStore.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(`${this.baseURL}/api/user/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: authStore.refreshToken })
      })

      const resData = await response.json()
      if (resData.code === 200) {
        const { access_token, refresh_token } = resData.data
        authStore.updateTokens(access_token, refresh_token)
        return access_token
      } else {
        throw new Error(resData.msg || 'Failed to refresh token')
      }
    } catch (error) {
      // 刷新失败，清除认证信息并跳转到登录页
      authStore.logout()
      window.location.href = '/login'
      throw error
    }
  }

  async request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const authStore = useAuthStore()
    
    // 添加认证头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, requestOptions)

      // 如果是401错误，尝试刷新令牌
      if (response.status === 401 && authStore.accessToken) {
        if (this.isRefreshing) {
          // 如果正在刷新，将请求加入队列
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject })
          }).then(() => {
            return this.request<T>(url, options)
          })
        }

        this.isRefreshing = true

        try {
          await this.refreshToken()
          this.isRefreshing = false
          this.processQueue(null)

          return this.request<T>(url, options)
        } catch (refreshError) {
          this.isRefreshing = false
          this.processQueue(refreshError)
          throw refreshError
        }
      }

      // 处理响应数据
      const data = await response.json()
      
      if (data.code === 200) {
        return data.data as T
      } else {
        throw new Error(data.msg || 'Request failed')
      }
    } catch (error) {
      console.error('HTTP request failed:', error)
      throw error
    }
  }

  async get<T = any>(url: string, options: RequestInit = {}) {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, options: RequestInit = {}) {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(url: string, data?: any, options: RequestInit = {}) {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(url: string, options: RequestInit = {}) {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

// 创建全局HTTP客户端实例
export const httpClient = new HttpClient(API_CONFIG.baseURL)

// 便捷方法
export const api = {
  get: <T = any>(url: string, options?: RequestInit) => httpClient.get<T>(url, options),
  post: <T = any>(url: string, data?: any, options?: RequestInit) => httpClient.post<T>(url, data, options),
  put: <T = any>(url: string, data?: any, options?: RequestInit) => httpClient.put<T>(url, data, options),
  delete: <T = any>(url: string, options?: RequestInit) => httpClient.delete<T>(url, options),
}
