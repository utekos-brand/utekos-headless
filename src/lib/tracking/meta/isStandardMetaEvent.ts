import type { MetaEventType } from 'types/tracking/meta/event'

const STANDARD_META_EVENTS: ReadonlySet<MetaEventType> = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Purchase',
  'Lead'
])

export function isStandardMetaEvent(eventName: MetaEventType): boolean {
  return STANDARD_META_EVENTS.has(eventName)
}
