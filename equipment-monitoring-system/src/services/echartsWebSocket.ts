// ECharts数据WebSocket服务
export class EChartsWebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private listeners: Map<string, Function[]> = new Map()
  private baseUrl: string = 'ws://127.0.0.1:8000'
  private isConnected = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private equipmentName: string = ''
  private classShift: string = ''
  private allowReconnect = true // 控制是否允许重连

  // 连接WebSocket
  connect(equipmentName: string, classShift: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.equipmentName === equipmentName && this.classShift === classShift) {
        resolve()
        return
      }

      // 如果已有连接，先关闭
      if (this.ws) {
        this.ws.close()
      }

      this.equipmentName = equipmentName
      this.classShift = classShift
      this.allowReconnect = true // 允许重连
      
      // 构建WebSocket URL，添加查询参数
      const wsUrl = `${this.baseUrl}/api/ws/echarts?equ_name=${encodeURIComponent(equipmentName)}&class_shift=${encodeURIComponent(classShift)}`
      
      try {
        this.ws = new WebSocket(wsUrl)
        
        this.ws.onopen = () => {
          console.log(`[ECharts WebSocket] 连接成功: ${wsUrl}`)
          this.isConnected = true
          this.reconnectAttempts = 0
          this.emit('connected', { equipmentName, classShift })
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            // 处理ping消息
            if (data.type === 'ping') {
              return
            }
            
            console.log(`[ECharts WebSocket] 收到设备 ${equipmentName} 数据更新:`, data)
            this.emit('message', data)
          } catch (error) {
            console.error('[ECharts WebSocket] 解析消息失败:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log(`[ECharts WebSocket] 连接关闭: ${event.code} ${event.reason}`)
          this.isConnected = false
          this.emit('disconnected', { event, equipmentName, classShift })
          
          // 尝试重连
          if (this.allowReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`[ECharts WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            
            this.reconnectTimer = setTimeout(() => {
              this.connect(equipmentName, classShift).catch(() => {
                // 重连失败会在下一次重试
              })
            }, this.reconnectInterval)
          } else {
            if (!this.allowReconnect) {
              console.log('[ECharts WebSocket] 手动断开连接，不进行重连')
            } else {
              console.error('[ECharts WebSocket] 达到最大重连次数，停止重连')
              this.emit('error', new Error('达到最大重连次数'))
            }
          }
        }

        this.ws.onerror = (error) => {
          console.error('[ECharts WebSocket] 连接错误:', error)
          this.emit('error', error)
        }
      } catch (error) {
        console.error('[ECharts WebSocket] 创建连接失败:', error)
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
    this.classShift = ''
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

  // 获取当前班次
  get currentClassShift(): string {
    return this.classShift
  }
}

// 创建单例实例
export const createEChartsWebSocketService = (baseUrl: string = 'ws://127.0.0.1:8000') => {
  return new EChartsWebSocketService()
}