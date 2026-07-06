// Path: src/app/skreddersy-varmen/utils/landingTracking.ts

import { PRODUCT_VARIANTS } from '@/api/constants'

/**
 * Sentral konfigurasjon for sporing av annonse-landingssiden `/skreddersy-varmen`.
 * Holdes deterministisk slik at hver ViewContent/engasjements-hendelse er identisk
 * mellom server (CAPI) og klient (Pixel) for korrekt deduplisering.
 */
export const LANDING_PAGE_PATH = '/skreddersy-varmen'

export const LANDING_CONTENT = {
  contentName: 'Skreddersy Varmen Landing',
  contentCategory: 'Landing',
  contentType: 'product_group',
  /**
   * TechDown er heltproduktet på landingssiden. Vi speiler handle-en slik at
   * ViewContent på landingssiden kan kobles mot katalog/produktsignaler.
   */
  contentIds: ['utekos-techdown'] as const,
  currency: 'NOK',
  value: PRODUCT_VARIANTS['utekos-techdown'].price
} as const

/**
 * Seksjoner vi observerer for engasjements-signaler. `id` matcher DOM-anker
 * eller stabile data-attributter på landingssiden.
 */
export const LANDING_SECTIONS = [
  { id: 'section-solution', label: 'Solution' },
  { id: 'purchase-section', label: 'Purchase' }
] as const

/** Scroll-dybde i prosent som rapporteres én gang hver. */
export const LANDING_SCROLL_DEPTHS = [25, 50, 75, 100] as const

export type LandingSectionLabel = (typeof LANDING_SECTIONS)[number]['label']
