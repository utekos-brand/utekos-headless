import { z } from 'zod'
import { canonicalEventEnvelopeSchema, type CanonicalEventEnvelope, type ConsentSnapshot } from './canonicalEventEnvelope'
import { mapEventDeviceInfo } from './mapEventDeviceInfo'

export const canonicalSizeGuideViewCustomDataSchema = z.strictObject({
  guide_id: z.string().min(1),
  open_sequence: z.number().int().positive()
})

export type CanonicalSizeGuideViewCustomData = z.infer<
  typeof canonicalSizeGuideViewCustomDataSchema
>

export const canonicalSizeGuideViewSchema = canonicalEventEnvelopeSchema.extend({
  event_name: z.literal('size_guide_view'),
  source: z.literal('web'),
    page_url: z.string().url(),
    referrer_url: z.string().url().optional(),
    page_title: z.string().min(1),
  page_view_id: z.string().uuid(),
  custom_data: canonicalSizeGuideViewCustomDataSchema
})

export type CanonicalSizeGuideView = z.infer<typeof canonicalSizeGuideViewSchema>

type CreateCanonicalSizeGuideViewInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  consent: ConsentSnapshot
  customData: CanonicalSizeGuideViewCustomData
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

export type SizeGuideViewDataLayerEvent = {
  event: 'size_guide_view'
  event_id: string
  event_time: string
  source: 'web'
  page_view_id?: string
  custom_data: CanonicalSizeGuideViewCustomData
  canonical_event: CanonicalSizeGuideView
}

export function createCanonicalSizeGuideView(
  input: CreateCanonicalSizeGuideViewInput
): CanonicalSizeGuideView {
  const eventDeviceInfo = mapEventDeviceInfo(input.eventDeviceInfo)

  return canonicalSizeGuideViewSchema.parse({
    schema_version: 1,
    event_name: 'size_guide_view',
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

export function buildSizeGuideViewDataLayerEvent(
  event: CanonicalSizeGuideView
): SizeGuideViewDataLayerEvent {
  return {
    event: 'size_guide_view',
    event_id: event.event_id,
    event_time: event.event_time,
    source: event.source,
    ...(event.page_view_id ? { page_view_id: event.page_view_id } : {}),
    custom_data: event.custom_data,
    canonical_event: event
  }
}
