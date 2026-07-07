import type { MetaEventPayload } from 'types/tracking/meta'

const GOOGLE_SERVER_EVENT_FALLBACK_NAMES = new Set<NonNullable<MetaEventPayload['canonicalEventName']>>([
  'view_item_list',
  'select_item',
  'view_item',
  'add_to_cart',
  'begin_checkout',
  'purchase',
  'search',
  'generate_lead'
])

export function shouldQueueGoogleServerEvent(
  payload: MetaEventPayload,
  hasGoogleConsent: boolean
): boolean {
  return (
    hasGoogleConsent
    && payload.source === 'browser'
    && !!payload.ga4Data?.client_id
    && !!payload.canonicalEventName
    && GOOGLE_SERVER_EVENT_FALLBACK_NAMES.has(payload.canonicalEventName)
  )
}
