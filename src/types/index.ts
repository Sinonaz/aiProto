export interface Chat {
  id: string
  title: string
  lastMessage: string
  timestamp: number
  model: string
  assistantId?: string | null
}

export interface Message {
  id: string
  chatId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  sources?: Source[]
}

export interface Source {
  id: string
  title: string
  url: string
  snippet: string
}

export type ModelId = 'gpt-4o' | 'gpt-4o-mini' | 'claude-fable-5' | 'claude-haiku-4-5'

export interface Model {
  id: ModelId
  name: string
  provider: string
  description: string
}
