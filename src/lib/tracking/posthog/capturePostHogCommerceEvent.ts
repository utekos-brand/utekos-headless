import posthog from 'posthog-js'
import { USERCENTRICS_POSTHOG_SERVICE_NAME } from '@/components/cookie-consent/usercentricsConfig'
import { hasServiceConsent } from '@/lib/tracking/consent/hasServiceConsent'
import type { MetaEventPayload } from 'types/tracking/meta/event'

type PostHogCommerceProperties = {
  schema_version: 1
  canonical_event_name: string
  provider_event_name?: string | undefined
  event_id?: string | undefined
  source?: string | undefined
  page_path?: string | undefined
  value?: number | undefined
  currency?: string | undefined
  content_type?: string | undefined
  content_ids?: string[] | undefined
  item_count?: number | undefined
  order_id?: string | undefined
}

export type PostHogCommerceEvent = {
  name: string
  properties: PostHogCommerceProperties
}

function safePathFromUrl(value: string | undefined): string | undefined {
  if (!value) return undefined

  try {
    return new URL(value).pathname
  } catch {
    return undefined
  }
}

function getItemCount(payload: MetaEventPayload): number | undefined {
  const items = payload.eventData?.contents ?? payload.eventData?.items
  if (Array.isArray(items)) return items.length
  return payload.eventData?.num_items
}

export function getPostHogCommerceEvent(payload: MetaEventPayload): PostHogCommerceEvent | null {
  const canonicalEventName = payload.canonicalEventName
  if (!canonicalEventName || canonicalEventName === 'custom') return null

  return {
    name: `utekos_${canonicalEventName}`,
    properties: {
      schema_version: 1,
      canonical_event_name: canonicalEventName,
      provider_event_name: payload.eventName,
      event_id: payload.eventId,
      source: payload.source,
      page_path: safePathFromUrl(payload.eventSourceUrl),
      value: payload.eventData?.value,
      currency: payload.eventData?.currency,
      content_type: payload.eventData?.content_type,
      content_ids: payload.eventData?.content_ids,
      item_count: getItemCount(payload),
      order_id: payload.eventData?.order_id ?? payload.eventData?.transaction_id
    }
  }
}

export function capturePostHogCommerceEvent(payload: MetaEventPayload): void {
  if (typeof window === 'undefined') return
  if (!hasServiceConsent(USERCENTRICS_POSTHOG_SERVICE_NAME)) return

  const event = getPostHogCommerceEvent(payload)
  if (!event) return

  posthog.capture(event.name, event.properties, {
    transport: 'sendBeacon',
    send_instantly: true
  })
}
