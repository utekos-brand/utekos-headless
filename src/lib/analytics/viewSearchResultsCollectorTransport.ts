import { createCanonicalCollectorTransport } from './createCanonicalCollectorTransport'
import type { CanonicalViewSearchResults } from './viewSearchResultsEvent'

export const startViewSearchResultsCollectorTransport =
  createCanonicalCollectorTransport<CanonicalViewSearchResults>({
    analyticsEventName: 'view_search_results',
    endpoint: '/api/events/view-search-results'
  })
