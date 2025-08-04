import axios from 'axios'

const difyApi = axios.create({
  baseURL: import.meta.env.VITE_DIFY_API_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_DIFY_API_KEY}`,
    'Content-Type': 'application/json'
  }
})

export interface DifyMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface DifyChatRequest {
  inputs: Record<string, any>
  query: string
  response_mode: 'streaming' | 'blocking'
  conversation_id?: string
  user: string
}

export interface DifyChatResponse {
  conversation_id: string
  message_id: string
  mode: 'chat' | 'completion'
  answer: string
  metadata: {
    usage: {
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  }
  created_at: number
}

export const difyService = {
  // 发送聊天消息
  async sendMessage(query: string, conversationId?: string): Promise<DifyChatResponse> {
    const request: DifyChatRequest = {
      inputs: {},
      query,
      response_mode: 'blocking',
      conversation_id: conversationId,
      user: 'web-user'
    }

    try {
      const response = await difyApi.post<DifyChatResponse>('/chat-messages', request)
      return response.data
    } catch (error) {
      console.error('Dify API Error:', error)
      throw new Error('Failed to get response from Dify API')
    }
  },

  // 获取对话历史
  async getConversationMessages(conversationId: string): Promise<DifyMessage[]> {
    try {
      const response = await difyApi.get<{ messages: DifyMessage[] }>(`/conversations/${conversationId}/messages`)
      return response.data.messages
    } catch (error) {
      console.error('Dify API Error:', error)
      throw new Error('Failed to fetch conversation history')
    }
  }
}
