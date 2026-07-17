import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalFilterApply } from './filterApplyEvent'

export const startFilterApplyCollectorTransport =
  createCanonicalCollectorTransport<CanonicalFilterApply>({
    analyticsEventName: 'filter_apply',
    endpoint: '/api/events/filter-apply'
  })
