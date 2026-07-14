import { prepareAddToCartEvent } from '@/lib/tracking/logic/prepareAddToCartEvent'
import { dispatchTrackingEvent } from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import type { TrackAddToCartOptions } from 'types/cart'

export async function trackAddToCart(
  input: TrackAddToCartOptions
): Promise<void> {
  const eventData = prepareAddToCartEvent(input)

  await dispatchTrackingEvent({
    eventName: 'AddToCart',
    eventId: eventData.eventID,
    destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
    eventData: {
      value: eventData.value,
      currency: eventData.currency,
      content_name: eventData.contentName,
      content_ids: eventData.contentIds,
      content_type: 'product',
      contents: eventData.contents,
      num_items: eventData.totalQty
    }
  })
}
