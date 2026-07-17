import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalSelectPromotion } from './selectPromotionEvent'

export const startSelectPromotionCollectorTransport =
  createCanonicalCollectorTransport<CanonicalSelectPromotion>({
    analyticsEventName: 'select_promotion',
    endpoint: '/api/events/select-promotion'
  })
