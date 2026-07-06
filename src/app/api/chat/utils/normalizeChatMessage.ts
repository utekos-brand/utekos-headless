import type { UIMessage } from 'ai'
import type { ChatMessageInput } from './ChatMessageSchema'
import { getTextFromLegacyContent } from './getTextFromLegacyContent'
import { hasNonEmptyTextPart } from './hasNonEmptyTextPart'

export function normalizeChatMessage(message: ChatMessageInput): UIMessage {
  const parts = Array.isArray(message.parts) ? message.parts : []
  const legacyText = getTextFromLegacyContent(message.content)
  const normalizedParts = hasNonEmptyTextPart(parts) || legacyText.trim().length === 0
    ? parts
    : [{ type: 'text' as const, text: legacyText }, ...parts]

  return {
    ...message,
    id: message.id ?? crypto.randomUUID(),
    role: message.role,
    parts: normalizedParts
  } as UIMessage
}
