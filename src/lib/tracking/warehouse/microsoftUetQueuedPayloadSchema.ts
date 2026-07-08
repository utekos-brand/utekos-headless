import { z } from 'zod'

import { trackingEventPayloadSchema } from '@/lib/tracking/utils/trackingEventPayloadSchema'

const checkoutAttributionSchema = z.object({
  cartId: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  userData: z.record(z.string(), z.unknown()),
  ts: z.number(),
  eventId: z.string().optional(),
  ga_client_id: z.string().optional(),
  ga_session_id: z.string().optional(),
  gclid: z.string().optional(),
  gbraid: z.string().optional(),
  wbraid: z.string().optional(),
  msclkid: z.string().optional(),
  dclid: z.string().optional()
})

export const microsoftUetQueuedPayloadSchema = z.object({
  trackingPayload: trackingEventPayloadSchema,
  attribution: checkoutAttributionSchema
})
