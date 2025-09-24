import { api } from '../utils/httpClient'

export interface UserProfile {
  username: string
  nickname: string
  create_time?: string
}

export interface UpdatePasswordRequest {
  old_password: string
  new_password: string
  confirm_password: string
}

export interface UpdatePasswordResponse {
  message: string
}

export interface UpdateNicknameRequest {
  nickname: string
}

export interface ResetPasswordRequest {
  username: string
  security_answer: string
  new_password: string
  confirm_password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const userService = {
  // 获取用户信息
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/api/user/profile')
      const data = await response.json()
      return data as UserProfile
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw new Error('获取用户信息失败')
    }
  },

  // 修改密码
  async updatePassword(passwordData: UpdatePasswordRequest): Promise<UserProfile> {
    try {
      const response = await api.post('/api/user/update_password', passwordData)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '修改密码失败')
      }
      
      const data = await response.json()
      return data as UserProfile
    } catch (error: any) {
      console.error('修改密码失败:', error)
      
      // 如果是HTTP错误，抛出具体的错误信息
      if (error.message && error.message !== '修改密码失败') {
        throw error
      }
      
      throw new Error('修改密码失败，请检查网络连接')
    }
  },

  // 刷新token
  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      const response = await api.post('/api/user/refresh', refreshTokenData)
      const data = await response.json()
      return data as RefreshTokenResponse
    } catch (error) {
      console.error('刷新token失败:', error)
      throw new Error('刷新token失败')
    }
  },

  // 修改昵称
  async updateNickname(nicknameData: UpdateNicknameRequest): Promise<UserProfile> {
    try {
      const response = await api.post('/api/user/update_nickname', nicknameData)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '修改昵称失败')
      }
      
      const data = await response.json()
      return data as UserProfile
    } catch (error: unknown) {
      console.error('修改昵称失败:', error)
      
      // 如果是HTTP错误，抛出具体的错误信息
      if ((error as Error).message && (error as Error).message !== '修改昵称失败') {
        throw error
      }
      
      throw new Error('修改昵称失败，请检查网络连接')
    }
  },

  // 重置密码（通过安全问题）
  async resetPassword(resetData: ResetPasswordRequest): Promise<UserProfile> {
    try {
      const response = await api.post('/api/user/reset_password', resetData)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || '重置密码失败')
      }
      
      const data = await response.json()
      return data as UserProfile
    } catch (error: unknown) {
      console.error('重置密码失败:', error)
      
      // 如果是HTTP错误，抛出具体的错误信息
      if ((error as Error).message && (error as Error).message !== '重置密码失败') {
        throw error
      }
      
      throw new Error('重置密码失败，请检查网络连接')
    }
  },

  // 退出登录
  async logout(): Promise<void> {
    try {
      await api.post('/api/user/logout')
    } catch (error) {
      console.error('退出登录失败:', error)
      throw new Error('退出登录失败')
    }
  }
}
