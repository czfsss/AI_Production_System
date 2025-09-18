// WebSocket服务
export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private listeners: Map<string, Function[]> = new Map()
  private url: string
  private equipmentName: string = ''
  private isConnected = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private allowReconnect = true // 控制是否允许重连

  constructor(url: string) {
    this.url = url
  }

  // 连接WebSocket
  connect(equipmentName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.equipmentName === equipmentName) {
        resolve()
        return
      }

      // 如果已有连接，先关闭
      if (this.ws) {
        this.ws.close()
      }

      this.equipmentName = equipmentName
      this.allowReconnect = true // 允许重连
      const wsUrl = `${this.url}/api/ws/equipment/${encodeURIComponent(equipmentName)}`
      
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

  // 添加事件监听器
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // 移除事件监听器
  off(event: string, callback: Function): void {
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
}

// 创建单例实例
export const createWebSocketService = (baseUrl: string = 'ws://127.0.0.1:8000') => {
  return new WebSocketService(baseUrl)
}