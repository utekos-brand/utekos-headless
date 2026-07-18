import { z } from 'zod'
import { canonicalEventEnvelopeSchema } from './canonicalEventEnvelope'

export const metaParameterContextRequestSchema = z.strictObject({
  consent: canonicalEventEnvelopeSchema.shape.consent.refine(
    consent => consent.marketing === 'granted',
    { message: 'Marketing consent is required' }
  ),
  fbclid: z.string().trim().min(1).max(4096).optional(),
  page_url: z.string().url().max(4096),
  referrer_url: z.string().url().max(4096).optional()
})

export const metaParameterContextResponseSchema = z.strictObject(
  { fbc: z.string().min(1).optional(), fbp: z.string().min(1) }
)

export type MetaParameterContextRequest = z.infer<
  typeof metaParameterContextRequestSchema
>

export type MetaParameterContextResponse = z.infer<
  typeof metaParameterContextResponseSchema
>
