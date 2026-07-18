'use client'

import { reportCanonicalSelectPromotion } from '@/lib/analytics/selectPromotionReporter'

export const LANDING_PROMOTIONS = {
  heroCta: {
    promotion_id: 'skreddersy-varmen-hero-cta',
    creative_name: 'Finn din favoritt'
  },
  heroSecondary: {
    promotion_id: 'skreddersy-varmen-hero-secondary',
    creative_name: 'Se løsningen'
  },
  empathyCta: {
    promotion_id: 'skreddersy-varmen-empathy-cta',
    creative_name: 'Utforsk kolleksjonen'
  },
  stickyClose: {
    promotion_id: 'skreddersy-varmen-sticky-close',
    creative_name: 'Lukk'
  },
  stickyCta: {
    promotion_id: 'skreddersy-varmen-sticky-cta',
    creative_name: 'Sticky CTA'
  },
  stickyOrder: {
    promotion_id: 'skreddersy-varmen-sticky-order',
    creative_name: 'Til bestilling'
  },
  sizeGuide: {
    promotion_id: 'skreddersy-varmen-size-guide',
    creative_name: 'Se størrelsesguide'
  },
  shippingReturns: {
    promotion_id: 'skreddersy-varmen-shipping-returns',
    creative_name: 'Frakt og retur'
  }
} as const

export type LandingPromotionKey = keyof typeof LANDING_PROMOTIONS

export function reportLandingSelectPromotion(
  key: LandingPromotionKey
): void {
  const promotion = LANDING_PROMOTIONS[key]
  reportCanonicalSelectPromotion({
    customData: {
      interaction_id: globalThis.crypto.randomUUID(),
      promotion_id: promotion.promotion_id,
      creative_name: promotion.creative_name
    }
  })
}
