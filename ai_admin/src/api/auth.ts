import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: { username: string; password: string }) {
  return request.post<{
    access_token: string
    refresh_token: string
    token_type: string
    user_info: {
      username: string
      real_name: string
      create_time: string | null
      roles?: string[]
      permissions?: string[]
      department?: string
    }
  }>({
    url: '/user/login',
    data: params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 注册
 * @param params 注册参数
 * @returns 注册响应
 */
export function fetchRegister(params: {
  username: string
  password: string
  confirm_password: string
  real_name: string
  department: string
}) {
  return request.post<{
    access_token: string
    refresh_token: string
    token_type: string
    user_info: {
      username: string
      real_name: string
      create_time: string | null
      roles?: string[]
      permissions?: string[]
      department?: string
    }
  }>({
    url: '/user/register',
    data: params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<{
    username: string
    real_name: string
    create_time: string | null
    roles?: string[]
    permissions?: string[]
    phone?: string
    gender?: string
    status?: number
    department?: string
  }>({
    url: '/user/profile'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

export function fetchUpdateRealName(params: { real_name: string }) {
  return request.post<{
    username: string
    real_name: string
    create_time: string | null
    roles?: string[]
    permissions?: string[]
  }>({
    url: '/user/update_real_name',
    data: params,
    showSuccessMessage: true
  })
}

export function fetchUpdatePassword(params: {
  old_password?: string
  new_password: string
  confirm_password: string
}) {
  return request.post<{
    username: string
    real_name: string
    create_time: string | null
    department?: string
    phone?: string
    gender?: string
    status?: number
  }>({
    url: '/user/update_password',
    data: params,
    showSuccessMessage: true
  })
}

/**
 * 刷新令牌
 * @param params 刷新令牌参数
 * @returns 新的令牌信息
 */
export function fetchRefreshToken(params: { refresh_token: string }) {
  return request.post<{
    access_token: string
    refresh_token: string
    token_type: string
    user_info: any
  }>({
    url: '/user/refresh',
    data: params,
    showErrorMessage: false // 刷新失败由拦截器处理，不显示通用错误
  })
}
