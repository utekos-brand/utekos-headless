import { z } from 'zod'
import { canonicalCommerceValueSchema } from './canonicalCommerceItem'
import { canonicalEventEnvelopeSchema, type CanonicalEventEnvelope, type ConsentSnapshot } from './canonicalEventEnvelope'
import { mapEventDeviceInfo } from './mapEventDeviceInfo'

export const canonicalRemoveFromCartCustomDataSchema = canonicalCommerceValueSchema.extend({
  cart_mutation_id: z.string().min(1),
  cart_id: z.string().min(1)
})

export type CanonicalRemoveFromCartCustomData = z.infer<
  typeof canonicalRemoveFromCartCustomDataSchema
>

export const canonicalRemoveFromCartSchema = canonicalEventEnvelopeSchema.extend({
  event_name: z.literal('remove_from_cart'),
  source: z.literal('web'),
    page_url: z.string().url(),
    referrer_url: z.string().url().optional(),
    page_title: z.string().min(1),
  page_view_id: z.string().uuid().optional(),
  custom_data: canonicalRemoveFromCartCustomDataSchema
})

export type CanonicalRemoveFromCart = z.infer<typeof canonicalRemoveFromCartSchema>

type CreateCanonicalRemoveFromCartInput = {
  browserId?: Record<string, string>
  clickId?: Record<string, string>
  consent: ConsentSnapshot
  customData: CanonicalRemoveFromCartCustomData
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

export type RemoveFromCartDataLayerEvent = {
  event: 'remove_from_cart'
  event_id: string
  event_time: string
  source: 'web'
  page_view_id?: string
  custom_data: CanonicalRemoveFromCartCustomData
  canonical_event: CanonicalRemoveFromCart
}

export function createCanonicalRemoveFromCart(
  input: CreateCanonicalRemoveFromCartInput
): CanonicalRemoveFromCart {
  const eventDeviceInfo = mapEventDeviceInfo(input.eventDeviceInfo)

  return canonicalRemoveFromCartSchema.parse({
    schema_version: 1,
    event_name: 'remove_from_cart',
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

export function buildRemoveFromCartDataLayerEvent(
  event: CanonicalRemoveFromCart
): RemoveFromCartDataLayerEvent {
  return {
    event: 'remove_from_cart',
    event_id: event.event_id,
    event_time: event.event_time,
    source: event.source,
    ...(event.page_view_id ? { page_view_id: event.page_view_id } : {}),
    custom_data: event.custom_data,
    canonical_event: event
  }
}
