import type { UIMessage } from 'ai'
import { ChatRequestSchema } from './ChatRequestSchema'
import { normalizeChatMessage } from './normalizeChatMessage'

export function normalizeChatMessages(payload: unknown): UIMessage[] {
  const chatRequest = ChatRequestSchema.parse(payload)

  if ('messages' in chatRequest) {
    return chatRequest.messages.map(normalizeChatMessage)
  }

  if (typeof chatRequest.message === 'string') {
    return [
      {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: chatRequest.message }]
      }
    ]
  }

  return [normalizeChatMessage(chatRequest.message)]
}
