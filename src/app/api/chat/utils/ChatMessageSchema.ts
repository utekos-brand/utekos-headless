import { z } from 'zod'

export const ChatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['system', 'user', 'assistant']),
  parts: z.array(z.unknown()).optional(),
  content: z.unknown().optional()
}).passthrough()

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>
