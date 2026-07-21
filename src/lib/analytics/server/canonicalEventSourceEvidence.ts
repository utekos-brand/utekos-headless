import { z } from 'zod'
import type { CanonicalEvent } from '../canonicalEvent'

const sourceIdentifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9][a-z0-9_-]*$/)
const sourceValueSchema = z.string().trim().min(1).max(255)
const sourceTopicSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_/-]*$/)
const sourceApiVersionSchema = z
  .string()
  .trim()
  .max(32)
  .regex(/^(?:\d{4}-\d{2}|unstable)$/)
const isoTimestampSchema = z
  .string()
  .datetime({ offset: true })
  .transform(value => new Date(value).toISOString())

export const canonicalEventSourceEvidenceSchema = z.strictObject(
  {
    canonical_event_id: z.string().uuid(),
    source_system: sourceIdentifierSchema,
    source_method: sourceIdentifierSchema,
    source_object_type: sourceIdentifierSchema,
    source_object_id: sourceValueSchema,
    source_topic: sourceTopicSchema,
    source_delivery_id: sourceValueSchema.nullable(),
    source_event_id: sourceValueSchema.nullable(),
    source_api_version: sourceApiVersionSchema,
    source_triggered_at: isoTimestampSchema,
    source_observed_at: isoTimestampSchema
  }
)

export type CanonicalEventSourceEvidence = z.infer<
  typeof canonicalEventSourceEvidenceSchema
>

export type CanonicalEventSourceEvidenceInsert =
  CanonicalEventSourceEvidence & {
    canonical_event_name: CanonicalEvent['event_name']
    canonical_idempotency_key: string
    observation_key: string
  }

function createObservationKey(
  evidence: CanonicalEventSourceEvidence
) {
  if (evidence.source_delivery_id) {
    return [
      evidence.source_system,
      evidence.source_method,
      'delivery',
      evidence.source_delivery_id
    ].join(':')
  }

  return [
    evidence.source_system,
    evidence.source_method,
    evidence.source_object_type,
    evidence.source_object_id,
    evidence.source_topic,
    evidence.source_api_version,
    evidence.canonical_event_id
  ].join(':')
}

export function mapCanonicalEventSourceEvidencePersistence(input: {
  event: Pick<CanonicalEvent, 'event_id' | 'event_name'>
  sourceEvidence: unknown
}): CanonicalEventSourceEvidenceInsert {
  const evidence = canonicalEventSourceEvidenceSchema.parse(
    input.sourceEvidence
  )

  if (evidence.canonical_event_id !== input.event.event_id) {
    throw new Error('source_evidence_event_id_mismatch')
  }

  return {
    ...evidence,
    canonical_event_name: input.event.event_name,
    canonical_idempotency_key: `${input.event.event_name}:${input.event.event_id}`,
    observation_key: createObservationKey(evidence)
  }
}
