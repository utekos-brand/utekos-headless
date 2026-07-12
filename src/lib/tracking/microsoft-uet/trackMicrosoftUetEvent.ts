import { hasServiceConsent } from '@/lib/tracking/consent/hasServiceConsent'
import { COOKIEBOT_MICROSOFT_SERVICE_NAME } from '@/components/cookie-consent/cookiebotConfig'
import { mapToCanonicalEventName } from '@/lib/tracking/events/mapToCanonicalEventName'
import type { MetaEventData, MetaEventType } from 'types/tracking/meta/event'

type MicrosoftUetPayloadValue =
  | string
  | number
  | string[]
  | Record<string, string | number>

type MicrosoftUetPayload = Record<string, MicrosoftUetPayloadValue>
type MicrosoftUetQueueItem = string | MicrosoftUetPayload
type MicrosoftUetQueue = {
  push: (...items: MicrosoftUetQueueItem[]) => number | void
}
type MicrosoftUetPageType =
  | 'PURCHASE'
  | 'cart'
  | 'category'
  | 'home'
  | 'other'
  | 'product'
  | 'purchase'
  | 'searchresults'

export type TrackMicrosoftUetEventOptions = {
  eventName?: string | undefined
  category?: string | undefined
  action?: string | undefined
  label?: string | undefined
  value?: number | undefined
  revenueValue?: number | undefined
  currency?: string | undefined
  productId?: string | string[] | undefined
  pageType?: MicrosoftUetPageType | undefined
  eventId?: string | undefined
}

export type DispatchMicrosoftUetBrowserEventInput = {
  eventName: MetaEventType | string
  eventId?: string | undefined
  eventData?: MetaEventData | undefined
}

function addDefinedValue(
  payload: MicrosoftUetPayload,
  key: string,
  value: MicrosoftUetPayloadValue | undefined
): void {
  if (value === undefined) return
  if (typeof value === 'number' && !Number.isFinite(value)) return
  if (Array.isArray(value) && value.length === 0) return
  payload[key] = value
}

function normalizeProductIds(
  productId: string | string[] | undefined
): string | string[] | undefined {
  if (!productId) return undefined
  if (!Array.isArray(productId)) return productId

  const productIds = productId.filter(Boolean)
  if (productIds.length === 0) return undefined
  return productIds.length === 1 ? productIds[0] : productIds
}

function getEventDataProductIds(eventData: MetaEventData | undefined): string[] | undefined {
  if (!eventData) return undefined

  const contentIds = eventData.content_ids?.filter(Boolean)

  if (contentIds && contentIds.length > 0) {
    return contentIds
  }

  const contentItemIds = eventData.contents
    ?.map(item => item.id)
    .filter((itemId): itemId is string => Boolean(itemId))

  if (contentItemIds && contentItemIds.length > 0) {
    return contentItemIds
  }

  const ga4ItemIds = eventData.items
    ?.map(item => item.item_id)
    .filter((itemId): itemId is string => typeof itemId === 'string' && itemId.length > 0)

  return ga4ItemIds && ga4ItemIds.length > 0 ? ga4ItemIds : undefined
}

function getMicrosoftUetPageType(eventName: string): MicrosoftUetPageType {
  const canonicalEventName = mapToCanonicalEventName(eventName)

  switch (canonicalEventName) {
    case 'add_to_cart':
    case 'begin_checkout':
    case 'view_cart':
    case 'remove_from_cart':
      return 'cart'
    case 'purchase':
      return 'purchase'
    case 'view_item':
      return 'product'
    case 'view_item_list':
      return 'category'
    case 'search':
      return 'searchresults'
    case 'page_view':
    case 'select_item':
    case 'generate_lead':
    case 'refund':
    case 'custom':
      return 'other'
  }
}

function getMicrosoftUetEventAction(eventName: string): string {
  const canonicalEventName = mapToCanonicalEventName(eventName)

  switch (canonicalEventName) {
    case 'begin_checkout':
      return 'AutoEvent_begin_checkout'
    case 'purchase':
      return 'PRODUCT_PURCHASE'
    case 'custom':
      return eventName
    default:
      return canonicalEventName
  }
}

function getMicrosoftUetEventLabel(eventData: MetaEventData | undefined): string | undefined {
  return eventData?.content_name ?? eventData?.transaction_id ?? eventData?.order_id ?? eventData?.content_category
}

function getMicrosoftUetQueue(): MicrosoftUetQueue {
  const microsoftUetQueue = window.uetq

  if (microsoftUetQueue && typeof microsoftUetQueue.push === 'function') {
    return microsoftUetQueue as MicrosoftUetQueue
  }

  const queue: MicrosoftUetQueueItem[] = []
  window.uetq = queue
  return queue
}

export function trackMicrosoftUetEvent({
  eventName,
  category,
  action,
  label,
  value,
  revenueValue,
  currency,
  productId,
  pageType,
  eventId
}: TrackMicrosoftUetEventOptions): void {
  if (typeof window === 'undefined') return
  if (!hasServiceConsent(COOKIEBOT_MICROSOFT_SERVICE_NAME)) return

  const eventAction = eventName ?? action
  if (!eventAction) return

  const payload: MicrosoftUetPayload = {}

  addDefinedValue(payload, 'event_category', category)
  addDefinedValue(payload, 'event_label', label)
  addDefinedValue(payload, 'event_value', value)
  addDefinedValue(payload, 'event_id', eventId)
  addDefinedValue(payload, 'revenue_value', revenueValue)
  addDefinedValue(payload, 'currency', currency)
  addDefinedValue(payload, 'ecomm_prodid', normalizeProductIds(productId))
  addDefinedValue(payload, 'ecomm_pagetype', pageType)

  if (Object.keys(payload).length === 0) return

  getMicrosoftUetQueue().push('event', eventAction, payload)
}

export function dispatchMicrosoftUetBrowserEvent({
  eventName,
  eventId,
  eventData
}: DispatchMicrosoftUetBrowserEventInput): void {
  const value = eventData?.value
  const productIds = getEventDataProductIds(eventData)
  const currency = eventData?.currency
  const baseEvent = {
    eventName: getMicrosoftUetEventAction(eventName),
    category: eventData?.content_category ?? 'ecommerce',
    label: getMicrosoftUetEventLabel(eventData),
    value,
    revenueValue: value,
    currency,
    productId: productIds,
    pageType: getMicrosoftUetPageType(eventName),
    ...(eventId ? { eventId } : {})
  } satisfies TrackMicrosoftUetEventOptions

  trackMicrosoftUetEvent(baseEvent)
}
