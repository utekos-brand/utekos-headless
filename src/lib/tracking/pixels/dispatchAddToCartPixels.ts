import { logAttribution } from '@/lib/tracking/log/logAttribution'
import { hasServiceConsent } from '@/lib/tracking/consent/hasServiceConsent'
import { COOKIEBOT_META_SERVICE_NAME } from '@/components/cookie-consent/cookiebotConfig'
import type { DispatchPixelsOptions } from 'types/cart'

export function dispatchAddToCartPixels({
  eventData
}: DispatchPixelsOptions): void {
  const {
    eventID,
    contentName,
    contentIds,
    contents,
    value,
    currency,
    totalQty
  } = eventData

  logAttribution(contentName, value)

  if (typeof window === 'undefined') return

  if (hasServiceConsent(COOKIEBOT_META_SERVICE_NAME) && window.fbq) {
    window.fbq(
      'track',
      'AddToCart',
      {
        content_name: contentName,
        content_ids: contentIds,
        content_type: 'product',
        value,
        currency,
        contents,
        num_items: totalQty
      },
      { eventID }
    )
  }
}
