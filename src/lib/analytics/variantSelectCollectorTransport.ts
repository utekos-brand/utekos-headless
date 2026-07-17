import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalVariantSelect } from './variantSelectEvent'

export const startVariantSelectCollectorTransport =
  createCanonicalCollectorTransport<CanonicalVariantSelect>({
    analyticsEventName: 'variant_select',
    endpoint: '/api/events/variant-select'
  })
