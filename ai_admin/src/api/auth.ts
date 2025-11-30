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
      nickname: string
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
  nickname: string
  department: string
}) {
  return request.post<{
    access_token: string
    refresh_token: string
    token_type: string
    user_info: {
      username: string
      nickname: string
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
    nickname: string
    create_time: string | null
    roles?: string[]
    permissions?: string[]
    phone?: string
    gender?: string
    avatar?: string
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

export function fetchUpdateNickname(params: { nickname: string }) {
  return request.post<{
    username: string
    nickname: string
    create_time: string | null
    roles?: string[]
    permissions?: string[]
  }>({
    url: '/user/update_nickname',
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
    nickname: string
    create_time: string | null
    roles?: string[]
    permissions?: string[]
  }>({
    url: '/user/update_password',
    params,
    showSuccessMessage: true
  })
}

export function fetchUpdateProfile(params: {
  phone?: string
  gender?: string
  department?: string
}) {
  return request.post<{
    username: string
    nickname: string
    create_time: string | null
    roles?: string[]
    permissions?: string[]
    email?: string
    phone?: string
    gender?: string
    avatar?: string
    status?: number
  }>({
    url: '/user/update_profile',
    data: params,
    showSuccessMessage: true
  })
}
