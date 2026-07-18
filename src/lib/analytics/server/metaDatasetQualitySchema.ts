import { z } from 'zod'

const percentageSchema = z.number().min(0).max(100)

const percentageFeedbackSchema = z
  .object({
    description: z.string().optional(),
    percentage: percentageSchema
  })
  .passthrough()

const relativeIncreaseSchema = z
  .object({
    description: z.string().optional(),
    percentage: z.number().nonnegative()
  })
  .passthrough()

const matchKeyFeedbackSchema = z
  .object({
    coverage: percentageFeedbackSchema.optional(),
    identifier: z.string().min(1),
    potential_aly_acr_increase: relativeIncreaseSchema.optional()
  })
  .passthrough()

const diagnosticSchema = z
  .object({
    affected_event_count: z.number().int().nonnegative().optional(),
    description: z.string().optional(),
    name: z.string().min(1),
    percentage: percentageSchema.optional(),
    solution: z.string().optional(),
    total_event_count: z.number().int().nonnegative().optional()
  })
  .passthrough()

const dedupeKeyFeedbackSchema = z
  .object({
    browser_events_with_dedupe_key:
      percentageFeedbackSchema.optional(),
    dedupe_key: z.string().min(1),
    overall_browser_coverage_from_dedupe_key:
      percentageFeedbackSchema.optional(),
    server_events_with_dedupe_key:
      percentageFeedbackSchema.optional()
  })
  .passthrough()

const eventMatchQualitySchema = z
  .object({
    composite_score: z.number().min(0).max(10),
    diagnostics: z.array(diagnosticSchema).optional(),
    match_key_feedback: z.array(matchKeyFeedbackSchema).optional()
  })
  .passthrough()

const eventCoverageSchema = z
  .object({
    description: z.string().optional(),
    goal_percentage: percentageSchema.optional(),
    percentage: percentageSchema
  })
  .passthrough()

const dataFreshnessSchema = z
  .object({
    description: z.string().optional(),
    upload_frequency: z.string().min(1)
  })
  .passthrough()

export const metaDatasetQualityEventSchema = z
  .object({
    acr: relativeIncreaseSchema.nullish(),
    data_freshness: dataFreshnessSchema.nullish(),
    dedupe_key_feedback: z.array(dedupeKeyFeedbackSchema).nullish(),
    event_coverage: eventCoverageSchema.nullish(),
    event_match_quality: eventMatchQualitySchema.nullish(),
    event_name: z.string().min(1),
    event_potential_aly_acr_increase:
      relativeIncreaseSchema.nullish()
  })
  .passthrough()

export const metaDatasetQualityResponseSchema = z
  .object({
    web: z.array(metaDatasetQualityEventSchema)
  })
  .passthrough()

export type MetaDatasetQualityEvent = z.infer<
  typeof metaDatasetQualityEventSchema
>

export type MetaDatasetQualityResponse = z.infer<
  typeof metaDatasetQualityResponseSchema
>
