import { z } from 'zod'
import { ChatMessageSchema } from './ChatMessageSchema'

export const ChatRequestSchema = z.union([
  z.object({
    messages: z.array(ChatMessageSchema).min(1)
  }),
  z.object({
    message: ChatMessageSchema
  }),
  z.object({
    message: z.string().min(1)
  })
])

export type ChatRequestInput = z.infer<typeof ChatRequestSchema>
