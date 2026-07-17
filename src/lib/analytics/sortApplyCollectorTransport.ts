import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalSortApply } from './sortApplyEvent'

export const startSortApplyCollectorTransport =
  createCanonicalCollectorTransport<CanonicalSortApply>({
    analyticsEventName: 'sort_apply',
    endpoint: '/api/events/sort-apply'
  })
