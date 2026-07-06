import { z } from 'zod'
import type { MetaEventData, MetaEventPayload } from 'types/tracking/meta'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'

const microsoftUetCapiItemSchema = z
  .object({
    id: z.string().min(1),
    quantity: z.number().int().positive().optional(),
    price: z.number().nonnegative().optional(),
    name: z.string().min(1).optional()
  })
  .strict()

const microsoftUetCapiUserDataSchema = z
  .object({
    clientUserAgent: z.string().min(1).optional(),
    anonymousId: z.string().min(1).optional(),
    externalId: z.string().min(1).optional(),
    em: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
    ph: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
    clientIpAddress: z.string().min(1).optional(),
    msclkid: z.string().min(1).optional()
  })
  .strict()

const microsoftUetCapiCustomDataSchema = z
  .object({
    eventCategory: z.string().min(1).optional(),
    eventLabel: z.string().min(1).optional(),
    eventValue: z.number().optional(),
    transactionId: z.string().min(1).optional(),
    value: z.number().nonnegative().optional(),
    currency: z.string().length(3).optional(),
    items: z.array(microsoftUetCapiItemSchema).optional(),
    itemIds: z.array(z.string().min(1)).optional(),
    pageType: z.literal('purchase'),
    ecommTotalValue: z.number().nonnegative().optional()
  })
  .strict()

export const microsoftUetCapiPurchaseEventSchema = z
  .object({
    eventType: z.literal('custom'),
    eventId: z.string().min(1),
    eventName: z.literal('purchase'),
    eventTime: z.number().int().positive(),
    eventSourceUrl: z.string().url().optional(),
    adStorageConsent: z.literal('G'),
    userData: microsoftUetCapiUserDataSchema.optional(),
    customData: microsoftUetCapiCustomDataSchema
  })
  .strict()

export const microsoftUetCapiRequestSchema = z
  .object({
    data: z.array(microsoftUetCapiPurchaseEventSchema).min(1).max(1000),
    continueOnValidationError: z.boolean(),
    dataProvider: z.literal('utekos-headless')
  })
  .strict()

export type MicrosoftUetCapiPurchaseEvent = z.infer<typeof microsoftUetCapiPurchaseEventSchema>

function toFiniteNumber(value: unknown): number | undefined {
  const numericValue =
    typeof value === 'number' ? value
    : typeof value === 'string' ? Number(value)
    : Number.NaN

  return Number.isFinite(numericValue) ? numericValue : undefined
}

function toPositiveInteger(value: unknown): number | undefined {
  const numericValue = toFiniteNumber(value)

  return numericValue !== undefined && numericValue > 0 ? Math.trunc(numericValue) : undefined
}

function toNonEmptyString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  const stringValue = String(value).trim()

  return stringValue ? stringValue : undefined
}

function getEventValue(eventData: MetaEventData | undefined): number | undefined {
  return toFiniteNumber(eventData?.value)
}

function getEventItemIds(eventData: MetaEventData | undefined) {
  const directContentIds = eventData?.content_ids?.filter(Boolean)

  if (directContentIds && directContentIds.length > 0) {
    return directContentIds
  }

  const contentIds = eventData?.contents
    ?.map(item => item.id)
    .filter((itemId): itemId is string => Boolean(itemId))

  if (contentIds && contentIds.length > 0) {
    return contentIds
  }

  const itemIds = eventData?.items
    ?.map(item => item.item_id)
    .filter((itemId): itemId is string => typeof itemId === 'string' && itemId.length > 0)

  return itemIds && itemIds.length > 0 ? itemIds : undefined
}

function getEventItems(eventData: MetaEventData | undefined) {
  const gaItems = eventData?.items
    ?.map(item => {
      const id = toNonEmptyString(item.item_id)

      if (!id) {
        return null
      }

      return {
        id,
        ...(toPositiveInteger(item.quantity) ? { quantity: toPositiveInteger(item.quantity) } : {}),
        ...(toFiniteNumber(item.price) !== undefined ? { price: toFiniteNumber(item.price) } : {}),
        ...(toNonEmptyString(item.item_name) ? { name: toNonEmptyString(item.item_name) } : {})
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (gaItems && gaItems.length > 0) {
    return gaItems
  }

  const metaItems = eventData?.contents
    ?.map(item => {
      if (!item.id) {
        return null
      }

      return {
        id: item.id,
        ...(toPositiveInteger(item.quantity) ? { quantity: toPositiveInteger(item.quantity) } : {}),
        ...(toFiniteNumber(item.item_price) !== undefined ? { price: toFiniteNumber(item.item_price) } : {}),
        ...(toNonEmptyString(item.title) ? { name: toNonEmptyString(item.title) } : {})
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  return metaItems && metaItems.length > 0 ? metaItems : undefined
}

function getMicrosoftUetUserData(attribution: CheckoutAttribution) {
  const userData = attribution.userData
  const emailHash = userData.email ?? userData.email_hash
  const msclkid = attribution.msclkid ?? userData.msclkid

  return {
    ...(userData.client_user_agent ? { clientUserAgent: userData.client_user_agent } : {}),
    ...(attribution.ga_client_id ? { anonymousId: attribution.ga_client_id } : {}),
    ...(userData.external_id ? { externalId: userData.external_id } : {}),
    ...(emailHash ? { em: emailHash } : {}),
    ...(userData.phone ? { ph: userData.phone } : {}),
    ...(userData.client_ip_address ? { clientIpAddress: userData.client_ip_address } : {}),
    ...(msclkid ? { msclkid } : {})
  }
}

export function buildMicrosoftUetPurchaseEvent(
  payload: MetaEventPayload,
  attribution: CheckoutAttribution
): MicrosoftUetCapiPurchaseEvent {
  const eventData = payload.eventData
  const value = getEventValue(eventData)
  const currency = eventData?.currency
  const itemIds = getEventItemIds(eventData)
  const items = getEventItems(eventData)
  const transactionId = eventData?.transaction_id ?? eventData?.order_id

  return microsoftUetCapiPurchaseEventSchema.parse({
    eventType: 'custom',
    eventId: payload.eventId,
    eventName: 'purchase',
    eventTime: payload.eventTime ?? Math.floor(Date.now() / 1000),
    eventSourceUrl: payload.eventSourceUrl,
    adStorageConsent: 'G',
    userData: getMicrosoftUetUserData(attribution),
    customData: {
      eventCategory: 'ecommerce',
      ...(transactionId ? { eventLabel: transactionId, transactionId } : {}),
      ...(value !== undefined ? { eventValue: value, value, ecommTotalValue: value } : {}),
      ...(currency ? { currency } : {}),
      ...(items ? { items } : {}),
      ...(itemIds ? { itemIds } : {}),
      pageType: 'purchase'
    }
  })
}
