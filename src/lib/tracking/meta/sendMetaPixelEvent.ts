import { isStandardMetaEvent } from '@/lib/tracking/meta/isStandardMetaEvent'
import type { MetaEventData, MetaEventType } from 'types/tracking/meta/event'

export function sendMetaPixelEvent(
  eventName: MetaEventType,
  eventData: MetaEventData = {},
  eventId?: string
): boolean {
  if (typeof window === 'undefined' || !window.fbq) {
    return false
  }

  const eventOptions = eventId ? { eventID: eventId } : undefined

  if (isStandardMetaEvent(eventName)) {
    window.fbq('track', eventName, eventData, eventOptions)
    return true
  }

  window.fbq('trackCustom', eventName, eventData, eventOptions)
  return true
}
