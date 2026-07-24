import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalViewCategory } from './viewCategoryEvent'

export const startViewCategoryCollectorTransport =
  createCanonicalCollectorTransport<CanonicalViewCategory>({
    analyticsEventName: 'view_category',
    endpoint: '/api/events/view-category'
  })
