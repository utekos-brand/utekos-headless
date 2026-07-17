import { z } from 'zod'
import { canonicalEventEnvelopeSchema, type CanonicalEventEnvelope, type ConsentSnapshot } from './canonicalEventEnvelope'
import { mapEventDeviceInfo } from './mapEventDeviceInfo'

export const canonicalSortApplyCustomDataSchema = z.strictObject({
  interaction_id: z.string().min(1),
  result_revision: z.number().int().positive(),
  sort_key: z.string().min(1),
  result_count: z.number().int().nonnegative()
})

export type CanonicalSortApplyCustomData = z.infer<
  typeof canonicalSortApplyCustomDataSchema
>

export const canonicalSortApplySchema = canonicalEventEnvelopeSchema.extend({
  event_name: z.literal('sort_apply'),
  source: z.literal('web'),
    page_url: z.string().url(),
    referrer_url: z.string().url().optional(),
    page_title: z.string().min(1),
  page_view_id: z.string().uuid().optional(),
  custom_data: canonicalSortApplyCustomDataSchema
})

export type CanonicalSortApply = z.infer<typeof canonicalSortApplySchema>

type CreateCanonicalSortApplyInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  consent: ConsentSnapshot
  customData: CanonicalSortApplyCustomData
  environment: CanonicalEventEnvelope['environment']
  eventDeviceInfo?: Parameters<typeof mapEventDeviceInfo>[0]
  eventId: string
  eventTime: string
  externalId?: string
  impressionId?: string
  pageTitle?: string
  pageUrl?: string
  pageViewId?: string
  referrerUrl?: string
}

export type SortApplyDataLayerEvent = {
  event: 'sort_apply'
  event_id: string
  event_time: string
  source: 'web'
  page_view_id?: string
  custom_data: CanonicalSortApplyCustomData
  canonical_event: CanonicalSortApply
}

export function createCanonicalSortApply(
  input: CreateCanonicalSortApplyInput
): CanonicalSortApply {
  const eventDeviceInfo = mapEventDeviceInfo(input.eventDeviceInfo)

  return canonicalSortApplySchema.parse({
    schema_version: 1,
    event_name: 'sort_apply',
    event_id: input.eventId,
    event_time: input.eventTime,
    source: 'web',
    environment: input.environment,
    ...(input.pageUrl ? { page_url: input.pageUrl } : {}),
    ...(input.pageViewId ? { page_view_id: input.pageViewId } : {}),
    ...(input.referrerUrl ? { referrer_url: input.referrerUrl } : {}),
    ...(input.pageTitle ? { page_title: input.pageTitle } : {}),
    consent: input.consent,
    custom_data: input.customData,
    ...(input.browserId ? { browser_id: input.browserId } : {}),
    ...(input.clickId ? { click_id: input.clickId } : {}),
    ...(input.externalId ? { external_id: input.externalId } : {}),
    ...(input.impressionId ? { impression_id: input.impressionId } : {}),
    ...(eventDeviceInfo ? { event_device_info: eventDeviceInfo } : {})
  })
}

export function buildSortApplyDataLayerEvent(
  event: CanonicalSortApply
): SortApplyDataLayerEvent {
  return {
    event: 'sort_apply',
    event_id: event.event_id,
    event_time: event.event_time,
    source: event.source,
    ...(event.page_view_id ? { page_view_id: event.page_view_id } : {}),
    custom_data: event.custom_data,
    canonical_event: event
  }
}
