import { z } from 'zod'
import { canonicalEventEnvelopeSchema, type CanonicalEventEnvelope, type ConsentSnapshot } from './canonicalEventEnvelope'
import { mapEventDeviceInfo } from './mapEventDeviceInfo'

export const canonicalGenerateLeadCustomDataSchema = z.strictObject({
  submission_id: z.string().min(1),
  form_id: z.string().min(1),
  lead_type: z.string().min(1).optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  value: z.number().finite().nonnegative().optional()
})

export type CanonicalGenerateLeadCustomData = z.infer<
  typeof canonicalGenerateLeadCustomDataSchema
>

export const canonicalGenerateLeadSchema = canonicalEventEnvelopeSchema.extend({
  event_name: z.literal('generate_lead'),
  source: z.literal('server'),
    page_url: z.string().url().optional(),
  page_view_id: z.string().uuid().optional(),
  custom_data: canonicalGenerateLeadCustomDataSchema
})

export type CanonicalGenerateLead = z.infer<typeof canonicalGenerateLeadSchema>

type CreateCanonicalGenerateLeadInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  consent: ConsentSnapshot
  customData: CanonicalGenerateLeadCustomData
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

export type GenerateLeadDataLayerEvent = {
  event: 'generate_lead'
  event_id: string
  event_time: string
  source: 'server'
  page_view_id?: string
  custom_data: CanonicalGenerateLeadCustomData
  canonical_event: CanonicalGenerateLead
}

export function createCanonicalGenerateLead(
  input: CreateCanonicalGenerateLeadInput
): CanonicalGenerateLead {
  const eventDeviceInfo = mapEventDeviceInfo(input.eventDeviceInfo)

  return canonicalGenerateLeadSchema.parse({
    schema_version: 1,
    event_name: 'generate_lead',
    event_id: input.eventId,
    event_time: input.eventTime,
    source: 'server',
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

export function buildGenerateLeadDataLayerEvent(
  event: CanonicalGenerateLead
): GenerateLeadDataLayerEvent {
  return {
    event: 'generate_lead',
    event_id: event.event_id,
    event_time: event.event_time,
    source: event.source,
    ...(event.page_view_id ? { page_view_id: event.page_view_id } : {}),
    custom_data: event.custom_data,
    canonical_event: event
  }
}
