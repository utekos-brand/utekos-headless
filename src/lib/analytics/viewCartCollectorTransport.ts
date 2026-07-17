import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalViewCart } from './viewCartEvent'

export const startViewCartCollectorTransport =
  createCanonicalCollectorTransport<CanonicalViewCart>({
    analyticsEventName: 'view_cart',
    endpoint: '/api/events/view-cart'
  })
