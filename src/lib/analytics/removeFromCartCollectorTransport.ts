import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalRemoveFromCart } from './removeFromCartEvent'

export const startRemoveFromCartCollectorTransport =
  createCanonicalCollectorTransport<CanonicalRemoveFromCart>({
    analyticsEventName: 'remove_from_cart',
    endpoint: '/api/events/remove-from-cart'
  })
