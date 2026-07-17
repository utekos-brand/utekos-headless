import { enrichCanonicalViewItemWithGoogleAnalyticsIds } from './googleAnalyticsBrowserIds'
import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalAddToCart } from './addToCartEvent'
import type { CanonicalViewItem } from './viewItemEvent'

async function enrichAddToCart(
  event: CanonicalAddToCart
): Promise<CanonicalAddToCart> {
  const enriched = await enrichCanonicalViewItemWithGoogleAnalyticsIds(
    event as unknown as CanonicalViewItem
  )

  return enriched as unknown as CanonicalAddToCart
}

export const startAddToCartCollectorTransport =
  createCanonicalCollectorTransport<CanonicalAddToCart>({
    analyticsEventName: 'add_to_cart',
    endpoint: '/api/events/add-to-cart',
    enrichEvent: enrichAddToCart
  })
