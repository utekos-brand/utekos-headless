import { z } from 'zod'
import type { CanonicalBeginCheckout } from '../beginCheckoutEvent'
import { findGoogleClientId } from './findGoogleClientId'
import { findMicrosoftClickId } from './findMicrosoftClickId'

const microsoftUetCapiItemSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    quantity: z.number().int().positive().optional()
  })
  .strict()

const microsoftUetCapiUserDataSchema = z
  .object({
    anonymousId: z.string().min(1).optional(),
    clientIpAddress: z.string().min(1).optional(),
    clientUserAgent: z.string().min(1).optional(),
    em: z
      .string()
      .regex(/^[a-f0-9]{64}$/i)
      .optional(),
    externalId: z.string().min(1).optional(),
    msclkid: z.string().min(1).optional(),
    ph: z
      .string()
      .regex(/^[a-f0-9]{64}$/i)
      .optional()
  })
  .strict()

const microsoftUetCapiCustomDataSchema = z
  .object({
    currency: z.string().length(3).optional(),
    ecommTotalValue: z.number().nonnegative().optional(),
    eventCategory: z.string().min(1).optional(),
    eventLabel: z.string().min(1).optional(),
    eventValue: z.number().optional(),
    itemIds: z.array(z.string().min(1)).optional(),
    items: z.array(microsoftUetCapiItemSchema).optional(),
    pageType: z.literal('cart'),
    transactionId: z.string().min(1).optional(),
    value: z.number().nonnegative().optional()
  })
  .strict()

export const microsoftUetCapiBeginCheckoutEventSchema = z
  .object({
    adStorageConsent: z.literal('G'),
    customData: microsoftUetCapiCustomDataSchema,
    eventId: z.string().min(1),
    eventName: z.literal('begin_checkout'),
    eventSourceUrl: z.string().url().optional(),
    eventTime: z.number().int().positive(),
    eventType: z.literal('custom'),
    userData: microsoftUetCapiUserDataSchema.optional()
  })
  .strict()

export const microsoftUetCapiBeginCheckoutRequestSchema = z
  .object({
    continueOnValidationError: z.boolean(),
    data: z
      .array(microsoftUetCapiBeginCheckoutEventSchema)
      .min(1)
      .max(1000),
    dataProvider: z.literal('utekos-headless')
  })
  .strict()

export type MicrosoftUetCapiBeginCheckoutEvent = z.infer<
  typeof microsoftUetCapiBeginCheckoutEventSchema
>

export type MicrosoftUetCapiBeginCheckoutRequest = z.infer<
  typeof microsoftUetCapiBeginCheckoutRequestSchema
>

function buildUserData(event: CanonicalBeginCheckout) {
  const msclkid = findMicrosoftClickId(event.click_id)
  const anonymousId = findGoogleClientId(event.browser_id)
  const emailHash = event.user_data?.email_sha256?.[0]
  const phoneHash = event.user_data?.phone_sha256?.[0]

  return {
    ...(event.event_device_info?.user_agent ?
      { clientUserAgent: event.event_device_info.user_agent }
    : {}),
    ...(anonymousId ? { anonymousId } : {}),
    ...(event.external_id ? { externalId: event.external_id } : {}),
    ...(emailHash ? { em: emailHash } : {}),
    ...(phoneHash ? { ph: phoneHash } : {}),
    ...(event.client_ip_address ?
      { clientIpAddress: event.client_ip_address }
    : {}),
    ...(msclkid ? { msclkid } : {})
  }
}

export function mapCanonicalBeginCheckoutToMicrosoftUet(
  event: CanonicalBeginCheckout
): MicrosoftUetCapiBeginCheckoutEvent {
  if (event.consent.marketing !== 'granted') {
    throw new Error(
      'Microsoft UET CAPI begin_checkout requires granted marketing consent'
    )
  }

  const eventTime = Math.floor(Date.parse(event.event_time) / 1000)

  if (!Number.isFinite(eventTime) || eventTime <= 0) {
    throw new Error(
      'Microsoft UET CAPI event_time must be a valid timestamp'
    )
  }

  const items = event.custom_data.items.map(item => ({
    id: item.item_id,
    name: item.item_name,
    price: item.unit_price,
    quantity: item.quantity
  }))
  const itemIds = items.map(item => item.id)
  const value = event.custom_data.value
  const transactionId = event.custom_data.checkout_id

  return microsoftUetCapiBeginCheckoutEventSchema.parse({
    adStorageConsent: 'G',
    customData: {
      currency: event.custom_data.currency,
      ecommTotalValue: value,
      eventCategory: 'ecommerce',
      eventLabel: transactionId,
      eventValue: value,
      itemIds,
      items,
      pageType: 'cart',
      transactionId,
      value
    },
    eventId: event.event_id,
    eventName: 'begin_checkout',
    ...(event.page_url ? { eventSourceUrl: event.page_url } : {}),
    eventTime,
    eventType: 'custom',
    userData: buildUserData(event)
  })
}

export function buildMicrosoftUetCapiBeginCheckoutRequest(
  event: CanonicalBeginCheckout
): MicrosoftUetCapiBeginCheckoutRequest {
  return microsoftUetCapiBeginCheckoutRequestSchema.parse({
    continueOnValidationError: false,
    data: [mapCanonicalBeginCheckoutToMicrosoftUet(event)],
    dataProvider: 'utekos-headless'
  })
}
