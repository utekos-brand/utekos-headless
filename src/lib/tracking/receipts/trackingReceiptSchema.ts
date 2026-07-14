import { z } from 'zod'

const boundedText = z.string().trim().min(1).max(256)
const observedAt = z.union([
  z.string().datetime({ offset: true }),
  z.number().int().positive()
])
const commonFields = {
  idempotencyKey: boundedText,
  eventId: boundedText,
  eventName: boundedText,
  observedAt
}

const browserDispatchObservationSchema = z.object({
  ...commonFields,
  observationType: z.literal('browser_dispatch')
}).strict()

const sgtmIngressReceiptSchema = z.object({
  ...commonFields,
  observationType: z.literal('sgtm_ingress'),
  containerId: boundedText,
  containerVersion: boundedText,
  clientName: boundedText
}).strict()

const tagExecutionReceiptSchema = z.object({
  ...commonFields,
  observationType: z.literal('tag_execution'),
  containerId: boundedText,
  containerVersion: boundedText,
  clientName: boundedText,
  tagId: boundedText,
  tagStatus: boundedText,
  tagExecutionTimeMs: z.number().int().nonnegative().max(300_000).optional()
}).strict()

export const trackingReceiptSchema = z.discriminatedUnion('observationType', [
  sgtmIngressReceiptSchema,
  tagExecutionReceiptSchema
])

export const internalTaggingObservationSchema = z.discriminatedUnion('observationType', [
  browserDispatchObservationSchema,
  sgtmIngressReceiptSchema,
  tagExecutionReceiptSchema
])

export type TrackingReceipt = z.infer<typeof trackingReceiptSchema>
export type InternalTaggingObservation = z.infer<typeof internalTaggingObservationSchema>
