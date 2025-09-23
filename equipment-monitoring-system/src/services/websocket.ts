// WebSocket服务
import { API_CONFIG, getWebSocketUrl } from '../config/api'

export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private listeners: Map<string, ((data: any) => void)[]> = new Map()
  private equipmentName: string = ''
  private isConnected = false
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private allowReconnect = true // 控制是否允许重连

  // 连接WebSocket
  connect(equipmentName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果正在连接相同设备且已连接，直接返回成功
      if (this.isConnected && this.equipmentName === equipmentName && this.ws?.readyState === WebSocket.OPEN) {
        console.log(`[WebSocket] 设备 ${equipmentName} 已连接，跳过重复连接`)
        resolve()
        return
      }

      // 强制清理之前的连接
      this.forceDisconnect()

      this.equipmentName = equipmentName
      this.allowReconnect = true // 允许重连
      const wsUrl = `${getWebSocketUrl(API_CONFIG.endpoints.wsEquipment)}/${encodeURIComponent(equipmentName)}`
      
      console.log(`[WebSocket] 尝试连接: ${wsUrl}`)
      
      try {
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log(`[WebSocket] 连接成功: ${wsUrl}`)
          this.isConnected = true
          this.reconnectAttempts = 0
          this.emit('connected', { equipmentName })
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            // 处理ping消息
            if (data.type === 'ping') {
              return
            }
            
            console.log(`[WebSocket] 收到设备 ${equipmentName} 状态更新:`, data)
            this.emit('message', data)
          } catch (error) {
            console.error('[WebSocket] 解析消息失败:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log(`[WebSocket] 连接关闭: ${event.code} ${event.reason}`)
          this.isConnected = false
          this.emit('disconnected', { event, equipmentName })
          
          // 尝试重连
          if (this.allowReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`[WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            
            this.reconnectTimer = setTimeout(() => {
              this.connect(equipmentName).catch(() => {
                // 重连失败会在下一次重试
              })
            }, this.reconnectInterval)
          } else {
            if (!this.allowReconnect) {
              console.log('[WebSocket] 手动断开连接，不进行重连')
            } else {
              console.error('[WebSocket] 达到最大重连次数，停止重连')
              this.emit('error', new Error('达到最大重连次数'))
            }
          }
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] 连接错误:', error)
          this.emit('error', error)
        }
      } catch (error) {
        console.error('[WebSocket] 创建连接失败:', error)
        reject(error)
      }
    })
  }

  // 断开连接
  disconnect(): void {
    // 禁止重连
    this.allowReconnect = false
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnected = false
    this.equipmentName = ''
    this.reconnectAttempts = 0
  }

  // 强制断开连接（不改变重连状态）
  private forceDisconnect(): void {
    console.log('[WebSocket] 强制断开之前的连接...')
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      // 临时移除事件监听器，避免触发不必要的事件
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onmessage = null
      this.ws.onerror = null
      
      // 强制关闭连接
      if (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN) {
        this.ws.close()
      }
      this.ws = null
    }
    
    this.isConnected = false
    this.reconnectAttempts = 0
  }

  // 添加事件监听器
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // 移除事件监听器
  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 触发事件
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  // 获取连接状态
  get connected(): boolean {
    return this.isConnected
  }

  // 获取当前设备名称
  get currentEquipmentName(): string {
    return this.equipmentName
  }

  // 获取和设置重连状态
  get reconnectAllowed(): boolean {
    return this.allowReconnect
  }

  set reconnectAllowed(value: boolean) {
    this.allowReconnect = value
  }
}

// 创建单例实例
export const createWebSocketService = () => {
  return new WebSocketService()
}