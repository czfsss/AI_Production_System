/**
 * Dify AI故障分析服务
 * 提供流式故障分析功能
 */

export interface DifyAnalysisRequest {
  faultName: string    // 故障名称
  machineName: string  // 机台名称
}

export interface DifyAnalysisResponse {
  content: string
  isComplete: boolean
  error?: string
}

/**
 * 数据清理工具函数
 */
function cleanContent(value: unknown): string {
  if (typeof value === 'string') {
    return value
  } else if (value === null || value === undefined) {
    return ''
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  } else {
    // 对于对象类型，返回空字符串而不是[object Object]
    console.warn('检测到非字符串类型的内容:', typeof value, value)
    return ''
  }
}

/**
 * Dify API配置
 */
const DIFY_CONFIG = {
  baseUrl: 'http://10.43.32.231:1130',
  apiKey: 'app-inwM8H6aeEvcNWMpl0NbcYXv',
  endpoint: '/v1/chat-messages'
}

/**
 * 发起Dify AI故障分析请求（流式传输）
 * @param request 请求参数
 * @param onMessage 消息回调函数
 * @param onComplete 完成回调函数
 * @param onError 错误回调函数
 */
export async function requestDifyAnalysis(
  request: DifyAnalysisRequest,
  onMessage: (response: DifyAnalysisResponse) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    console.log('发起Dify分析请求:', request)
    
    const response = await fetch(`${DIFY_CONFIG.baseUrl}${DIFY_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: request.faultName,
        response_mode: 'streaming',
        user: request.machineName,
        conversation_id: '', // 可选：用于维持对话上下文
        inputs: {} // 可选：额外输入参数
      })
    })

    console.log('API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let messageCount = 0

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('流读取完成，总消息数:', messageCount)
          onComplete()
          break
        }

        // 解码数据并添加到缓冲区
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        console.log('接收到数据块:', chunk)
        
        // 处理SSE格式的数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行

        for (const line of lines) {
          if (line.trim() === '') continue
          
          console.log('处理行数据:', line)
          
          // 处理不同的事件格式
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              console.log('接收到完成信号')
              onComplete()
              return
            }

            try {
              const parsed = JSON.parse(data)
              console.log('解析的数据:', parsed)
              
              // 处理不同类型的消息 - 适配Dify的响应格式
              if (parsed.event === 'message' || parsed.event === 'agent_message') {
                messageCount++
                // 使用清理函数确保安全提取内容
                const content = cleanContent(parsed.answer) || 
                               cleanContent(parsed.data) || 
                               cleanContent(parsed.message) || 
                               cleanContent(parsed.text)
                
                console.log('消息内容:', content)
                if (content) {
                  onMessage({
                    content: content,
                    isComplete: false
                  })
                }
              } else if (parsed.event === 'message_end' || parsed.event === 'agent_thought') {
                // 使用清理函数确保安全提取内容
                const content = cleanContent(parsed.answer) || 
                               cleanContent(parsed.data) || 
                               cleanContent(parsed.message)
                
                if (content) {
                  onMessage({
                    content: content,
                    isComplete: true
                  })
                }
              } else if (parsed.event === 'error') {
                console.error('API返回错误:', parsed)
                onError(cleanContent(parsed.message) || '分析过程中发生错误')
                return
              } else {
                // 如果没有event字段，尝试直接获取内容
                const content = cleanContent(parsed.answer) || 
                               cleanContent(parsed.data) || 
                               cleanContent(parsed.text) || 
                               cleanContent(parsed.content)
                
                if (content) {
                  messageCount++
                  console.log('直接内容:', content)
                  onMessage({
                    content: content,
                    isComplete: false
                  })
                }
              }
            } catch (parseError) {
              console.warn('解析SSE数据失败:', parseError, 'Data:', data)
              // 如果JSON解析失败，只有当数据是有效字符串时才传递
              if (data && data !== '[DONE]' && typeof data === 'string' && data.trim()) {
                messageCount++
                onMessage({
                  content: data,
                  isComplete: false
                })
              }
            }
          } else if (line.startsWith('event: ')) {
            // 处理事件类型行
            console.log('事件类型:', line)
          } else if (line.trim() && !line.startsWith(':')) {
            // 处理其他可能的内容行
            console.log('其他内容行:', line)
            try {
              const parsed = JSON.parse(line)
              const content = cleanContent(parsed.answer) || 
                             cleanContent(parsed.data) || 
                             cleanContent(parsed.text) || 
                             cleanContent(parsed.content)
              if (content) {
                messageCount++
                onMessage({
                  content: content,
                  isComplete: false
                })
              }
            } catch {
              // 如果不是JSON，直接作为文本处理
              const cleanLine = line.trim()
              if (cleanLine && typeof cleanLine === 'string') {
                messageCount++
                onMessage({
                  content: cleanLine,
                  isComplete: false
                })
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  } catch (error) {
    console.error('Dify API请求失败:', error)
    onError(error instanceof Error ? error.message : '网络请求失败')
  }
}

/**
 * 生成机台名称（基于设备信息）
 * @param deviceInfo 设备信息
 * @returns 机台名称
 */
export function generateMachineName(deviceInfo: { type?: string; number?: string | number } | null): string {
  if (!deviceInfo) return '未知设备'
  
  return `${deviceInfo.type}-${deviceInfo.number}号机台`
}

/**
 * 简化版的故障分析请求（非流式）
 * @param request 请求参数
 * @returns Promise<string> 分析结果
 */
export async function requestDifyAnalysisSimple(request: DifyAnalysisRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullContent = ''
    
    requestDifyAnalysis(
      request,
      (response) => {
        fullContent += response.content
      },
      () => {
        resolve(fullContent)
      },
      (error) => {
        reject(new Error(error))
      }
    )
  })
}