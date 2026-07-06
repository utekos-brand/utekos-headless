import { z } from 'zod'

export const providerDispatchQueueItemSchema = z.object({
  id: z.string().uuid(),
  provider: z.enum(['meta', 'google']),
  eventId: z.string().nullable(),
  eventName: z.string().nullable(),
  payload: z.unknown(),
  attemptCount: z.number().int().nonnegative()
})
