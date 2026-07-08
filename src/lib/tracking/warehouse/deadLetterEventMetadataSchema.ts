import { z } from 'zod'

export const deadLetterEventMetadataSchema = z.object({
  providerDispatchAttemptId: z.string().uuid(),
  eventId: z.string().min(1).optional(),
  eventName: z.string().min(1).optional(),
  attemptCount: z.number().int().positive().optional()
})

export type DeadLetterEventMetadata = z.infer<typeof deadLetterEventMetadataSchema>
