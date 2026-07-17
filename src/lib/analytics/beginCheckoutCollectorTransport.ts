import { enrichCanonicalViewItemWithGoogleAnalyticsIds } from './googleAnalyticsBrowserIds'
import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalBeginCheckout } from './beginCheckoutEvent'
import type { CanonicalViewItem } from './viewItemEvent'

async function enrichBeginCheckout(
  event: CanonicalBeginCheckout
): Promise<CanonicalBeginCheckout> {
  const enriched = await enrichCanonicalViewItemWithGoogleAnalyticsIds(
    event as unknown as CanonicalViewItem
  )

  return enriched as unknown as CanonicalBeginCheckout
}

export const startBeginCheckoutCollectorTransport =
  createCanonicalCollectorTransport<CanonicalBeginCheckout>({
    analyticsEventName: 'begin_checkout',
    endpoint: '/api/events/begin-checkout',
    enrichEvent: enrichBeginCheckout
  })
