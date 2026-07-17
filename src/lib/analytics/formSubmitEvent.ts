import { z } from 'zod'
import { canonicalEventEnvelopeSchema, type CanonicalEventEnvelope, type ConsentSnapshot } from './canonicalEventEnvelope'
import { mapEventDeviceInfo } from './mapEventDeviceInfo'

export const canonicalFormSubmitCustomDataSchema = z.strictObject({
  submission_id: z.string().min(1),
  form_id: z.string().min(1),
  form_name: z.string().min(1),
  result: z.enum(['accepted', 'rejected'])
})

export type CanonicalFormSubmitCustomData = z.infer<
  typeof canonicalFormSubmitCustomDataSchema
>

export const canonicalFormSubmitSchema = canonicalEventEnvelopeSchema.extend({
  event_name: z.literal('form_submit'),
  source: z.literal('server'),
    page_url: z.string().url().optional(),
  page_view_id: z.string().uuid().optional(),
  custom_data: canonicalFormSubmitCustomDataSchema
})

export type CanonicalFormSubmit = z.infer<typeof canonicalFormSubmitSchema>

type CreateCanonicalFormSubmitInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  consent: ConsentSnapshot
  customData: CanonicalFormSubmitCustomData
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

export type FormSubmitDataLayerEvent = {
  event: 'form_submit'
  event_id: string
  event_time: string
  source: 'server'
  page_view_id?: string
  custom_data: CanonicalFormSubmitCustomData
  canonical_event: CanonicalFormSubmit
}

export function createCanonicalFormSubmit(
  input: CreateCanonicalFormSubmitInput
): CanonicalFormSubmit {
  const eventDeviceInfo = mapEventDeviceInfo(input.eventDeviceInfo)

  return canonicalFormSubmitSchema.parse({
    schema_version: 1,
    event_name: 'form_submit',
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

export function buildFormSubmitDataLayerEvent(
  event: CanonicalFormSubmit
): FormSubmitDataLayerEvent {
  return {
    event: 'form_submit',
    event_id: event.event_id,
    event_time: event.event_time,
    source: event.source,
    ...(event.page_view_id ? { page_view_id: event.page_view_id } : {}),
    custom_data: event.custom_data,
    canonical_event: event
  }
}
