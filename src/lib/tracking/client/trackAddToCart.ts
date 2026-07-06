import { prepareAddToCartEvent } from '@/lib/tracking/logic/prepareAddToCartEvent'
import { dispatchAddToCartPixels } from '@/lib/tracking/pixels/dispatchAddToCartPixels'
import { dispatchMetaTrackingEvent } from '@/lib/tracking/meta/dispatchMetaTrackingEvent'
import type { TrackAddToCartOptions } from 'types/cart'

export async function trackAddToCart(
  input: TrackAddToCartOptions
): Promise<void> {
  const eventData = prepareAddToCartEvent(input)

  dispatchAddToCartPixels({
    eventData,
    product: input.product,
    selectedVariant: input.selectedVariant
  })

  await dispatchMetaTrackingEvent({
    eventName: 'AddToCart',
    eventId: eventData.eventID,
    sendBrowserEvent: false,
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
