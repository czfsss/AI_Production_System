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

      if (response.ok) {
        const data = await response.json()
        authStore.updateTokens(data.access_token, data.refresh_token)
        return data.access_token
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error) {
      // 刷新失败，清除认证信息并跳转到登录页
      authStore.logout()
      window.location.href = '/login'
      throw error
    }
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const authStore = useAuthStore()
    
    // 添加认证头
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
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
            // 刷新完成后，使用新令牌重新请求
            const newHeaders = { ...headers }
            if (authStore.accessToken) {
              newHeaders['Authorization'] = `Bearer ${authStore.accessToken}`
            }
            return fetch(`${this.baseURL}${url}`, { ...requestOptions, headers: newHeaders })
          })
        }

        this.isRefreshing = true

        try {
          await this.refreshToken()
          this.isRefreshing = false
          this.processQueue(null)

          // 使用新令牌重新请求
          const newHeaders = { ...headers }
          if (authStore.accessToken) {
            newHeaders['Authorization'] = `Bearer ${authStore.accessToken}`
          }
          return fetch(`${this.baseURL}${url}`, { ...requestOptions, headers: newHeaders })
        } catch (refreshError) {
          this.isRefreshing = false
          this.processQueue(refreshError)
          throw refreshError
        }
      }

      return response
    } catch (error) {
      console.error('HTTP request failed:', error)
      throw error
    }
  }

  async get(url: string, options: RequestInit = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  async post(url: string, data?: any, options: RequestInit = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(url: string, data?: any, options: RequestInit = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(url: string, options: RequestInit = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }
}

// 创建全局HTTP客户端实例
export const httpClient = new HttpClient(API_CONFIG.baseURL)

// 便捷方法
export const api = {
  get: (url: string, options?: RequestInit) => httpClient.get(url, options),
  post: (url: string, data?: any, options?: RequestInit) => httpClient.post(url, data, options),
  put: (url: string, data?: any, options?: RequestInit) => httpClient.put(url, data, options),
  delete: (url: string, options?: RequestInit) => httpClient.delete(url, options),
}
