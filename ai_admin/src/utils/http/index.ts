import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

// 刷新Token相关变量
let isRefreshing = false
let requestsQueue: Array<(token: string) => void> = []

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  async (response: AxiosResponse<Http.BaseResponse>) => {
    // 后端API可能返回的数据格式与前端期望不同，这里做兼容处理
    if (response.data) {
      // 如果有code字段，说明是标准API响应格式
      if ('code' in response.data) {
        const { code, msg } = response.data
        if (code === ApiStatus.success) return response
        if (code === ApiStatus.unauthorized) {
          return handleUnauthorizedError(response.config as ExtendedAxiosRequestConfig, msg)
        }
        throw createHttpError(msg || $t('httpMsg.requestFailed'), code)
      } else {
        return response
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === ApiStatus.unauthorized) {
      return handleUnauthorizedError(error.config)
    }
    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/** 处理401错误（刷新Token机制） */
async function handleUnauthorizedError(config: ExtendedAxiosRequestConfig, message?: string) {
  const userStore = useUserStore()
  const { refreshToken } = userStore

  // 如果没有刷新令牌，或者当前请求就是刷新请求，直接登出
  // 注意：config.url 可能是相对路径，也可能包含 baseURL，稳妥起见检查是否包含 refresh 关键字
  if (!refreshToken || config.url?.includes('/user/refresh')) {
    logOut()
    const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)
    // 避免重复弹窗
    if (!config.url?.includes('/user/refresh')) {
      showError(error, true)
    }
    return Promise.reject(error)
  }

  // 如果正在刷新，将请求加入队列
  if (isRefreshing) {
    return new Promise((resolve) => {
      requestsQueue.push((token) => {
        if (config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        resolve(axiosInstance(config))
      })
    })
  }

  // 开始刷新
  isRefreshing = true

  try {
    // 手动发起刷新请求，避免循环依赖
    // 这里使用 axiosInstance 发送请求，但由于上面的拦截器会拦截 /user/refresh 的 401 错误并 reject，
    // 所以如果刷新 token 也失效了，会进入 catch 块
    const { data } = await axiosInstance.post('/user/refresh', { refresh_token: refreshToken })

    if (data.code === ApiStatus.success) {
      const newAccessToken = data.data.access_token
      const newRefreshToken = data.data.refresh_token

      // 更新 store
      userStore.setToken(newAccessToken, newRefreshToken)

      // 处理队列中的请求
      requestsQueue.forEach((cb) => cb(newAccessToken))
      requestsQueue = []

      // 重试当前请求
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${newAccessToken}`
      }
      return axiosInstance(config)
    } else {
      throw new Error('Refresh failed')
    }
  } catch (e) {
    // 刷新失败，清空队列并登出
    requestsQueue = []
    logOut()
    const error = createHttpError($t('httpMsg.sessionExpired'), ApiStatus.unauthorized)
    showError(error, true)
    return Promise.reject(error)
  } finally {
    isRefreshing = false
  }
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (
    ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<Http.BaseResponse<T>>(config)
    const payload = res.data as any

    if (payload && typeof payload === 'object' && 'code' in payload && 'data' in payload) {
      if (config.showSuccessMessage && payload.msg) {
        showSuccess(payload.msg)
      }
      return payload.data as T
    }

    if (config.showSuccessMessage && payload?.msg) {
      showSuccess(payload.msg)
    }
    return payload as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  delete<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  }
}

export default api
