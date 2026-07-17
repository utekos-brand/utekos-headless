import { z } from 'zod'
import { canonicalEventEnvelopeSchema, type CanonicalEventEnvelope, type ConsentSnapshot } from './canonicalEventEnvelope'
import { mapEventDeviceInfo } from './mapEventDeviceInfo'

export const canonicalVideoProgressCustomDataSchema = z.strictObject({
  video_id: z.string().min(1),
  milestone: z.union([
    z.literal(10),
    z.literal(25),
    z.literal(50),
    z.literal(75),
    z.literal(90),
    z.literal(100)
  ]),
  video_title: z.string().min(1),
  video_duration: z.number().finite().nonnegative(),
  video_current_time: z.number().finite().nonnegative(),
  video_percent: z.number().int().min(1).max(100)
})

export type CanonicalVideoProgressCustomData = z.infer<
  typeof canonicalVideoProgressCustomDataSchema
>

export const canonicalVideoProgressSchema = canonicalEventEnvelopeSchema.extend({
  event_name: z.literal('video_progress'),
  source: z.literal('web'),
    page_url: z.string().url(),
    referrer_url: z.string().url().optional(),
    page_title: z.string().min(1),
  page_view_id: z.string().uuid(),
  custom_data: canonicalVideoProgressCustomDataSchema
})

export type CanonicalVideoProgress = z.infer<typeof canonicalVideoProgressSchema>

type CreateCanonicalVideoProgressInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  consent: ConsentSnapshot
  customData: CanonicalVideoProgressCustomData
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

export type VideoProgressDataLayerEvent = {
  event: 'video_progress'
  event_id: string
  event_time: string
  source: 'web'
  page_view_id?: string
  custom_data: CanonicalVideoProgressCustomData
  canonical_event: CanonicalVideoProgress
}

export function createCanonicalVideoProgress(
  input: CreateCanonicalVideoProgressInput
): CanonicalVideoProgress {
  const eventDeviceInfo = mapEventDeviceInfo(input.eventDeviceInfo)

  return canonicalVideoProgressSchema.parse({
    schema_version: 1,
    event_name: 'video_progress',
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

export function buildVideoProgressDataLayerEvent(
  event: CanonicalVideoProgress
): VideoProgressDataLayerEvent {
  return {
    event: 'video_progress',
    event_id: event.event_id,
    event_time: event.event_time,
    source: event.source,
    ...(event.page_view_id ? { page_view_id: event.page_view_id } : {}),
    custom_data: event.custom_data,
    canonical_event: event
  }
}
