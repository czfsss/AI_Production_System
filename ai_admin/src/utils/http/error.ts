import { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { ApiStatus } from './status'
import { $t } from '@/locales'

// 错误响应接口
export interface ErrorResponse {
  code: number
  msg: string
  detail?: string
  data?: unknown
}

// 错误日志数据接口
export interface ErrorLogData {
  code: number
  message: string
  data?: unknown
  timestamp: string
  url?: string
  method?: string
  stack?: string
}

// 自定义 HttpError 类
export class HttpError extends Error {
  public readonly code: number
  public readonly data?: unknown
  public readonly timestamp: string
  public readonly url?: string
  public readonly method?: string

  constructor(
    message: string,
    code: number,
    options?: {
      data?: unknown
      url?: string
      method?: string
    }
  ) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.data = options?.data
    this.timestamp = new Date().toISOString()
    this.url = options?.url
    this.method = options?.method
  }

  public toLogData(): ErrorLogData {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      url: this.url,
      method: this.method,
      stack: this.stack
    }
  }
}

/**
 * 获取错误消息
 * @param status 错误状态码
 * @returns 错误消息
 */
const getErrorMessage = (status: number): string => {
  const errorMap: Record<number, string> = {
    [ApiStatus.error]: 'httpMsg.requestFailed',
    [ApiStatus.unauthorized]: 'httpMsg.unauthorized',
    [ApiStatus.forbidden]: 'httpMsg.forbidden',
    [ApiStatus.notFound]: 'httpMsg.notFound',
    [ApiStatus.methodNotAllowed]: 'httpMsg.methodNotAllowed',
    [ApiStatus.requestTimeout]: 'httpMsg.requestTimeout',
    [ApiStatus.internalServerError]: 'httpMsg.internalServerError',
    [ApiStatus.badGateway]: 'httpMsg.badGateway',
    [ApiStatus.serviceUnavailable]: 'httpMsg.serviceUnavailable',
    [ApiStatus.gatewayTimeout]: 'httpMsg.gatewayTimeout'
  }

  return $t(errorMap[status] || 'httpMsg.internalServerError')
}

/**
 * 处理错误
 * @param error 错误对象
 * @returns 错误对象
 */
export function handleError(error: AxiosError<ErrorResponse>): never {
  // 处理取消的请求
  if (error.code === 'ERR_CANCELED') {
    console.warn('Request cancelled:', error.message)
    throw new HttpError($t('httpMsg.requestCancelled'), ApiStatus.error)
  }

  const statusCode = error.response?.status

  // 尝试解析可能为字符串的响应数据
  let responseData: any = error.response?.data
  if (typeof responseData === 'string') {
    try {
      responseData = JSON.parse(responseData)
    } catch {
      // 解析失败，保持原样
    }
  }

  const errorMessage = responseData?.detail || responseData?.msg || error.message
  const requestConfig = error.config

  // 处理网络错误
  if (!error.response) {
    throw new HttpError($t('httpMsg.networkError'), ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    })
  }

  // 处理 HTTP 状态码错误
  // 优先使用后端返回的具体错误消息，如果没有，再使用状态码对应的通用消息
  const serverMessage =
    responseData?.detail ||
    responseData?.msg ||
    responseData?.message ||
    responseData?.error ||
    (typeof responseData === 'string' ? responseData : null)

  // 400 错误特殊处理：如果后端没有返回任何错误信息，则使用默认的 "请求失败"
  // 但为了避免覆盖后端的详细验证错误（如 Pydantic 校验错误），我们需要更仔细地处理
  if (statusCode === ApiStatus.error && !serverMessage) {
      // 尝试提取 Pydantic 的 detail 数组（如果有）
      if (Array.isArray(responseData?.detail)) {
          const details = responseData.detail.map((item: any) => item.msg).join('; ')
          if (details) {
               throw new HttpError(details, statusCode, {
                  data: responseData,
                  url: requestConfig?.url,
                  method: requestConfig?.method?.toUpperCase()
              })
          }
      }
  }

  const message =
    serverMessage ||
    (statusCode ? getErrorMessage(statusCode) : errorMessage || $t('httpMsg.requestFailed'))

  throw new HttpError(message, statusCode || ApiStatus.error, {
    data: responseData,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase()
  })
}

/**
 * 显示错误消息
 * @param error 错误对象
 * @param showMessage 是否显示错误消息
 */
export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.error(error.message)
  }
  // 记录错误日志
  console.error('[HTTP Error]', error.toLogData())
}

/**
 * 显示成功消息
 * @param message 成功消息
 * @param showMessage 是否显示消息
 */
export function showSuccess(message: string, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.success(message)
  }
}

/**
 * 判断是否为 HttpError 类型
 * @param error 错误对象
 * @returns 是否为 HttpError 类型
 */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError
}
