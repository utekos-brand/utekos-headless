import type { CanonicalViewSearchResults } from '../viewSearchResultsEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalViewSearchResultsToGoogleDataManager } from './mapCanonicalViewSearchResultsToGoogleDataManager'

export const dispatchCanonicalViewSearchResultsToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalViewSearchResults,
    'view_search_results'
  >({
    eventName: 'view_search_results',
    mapEvent: mapCanonicalViewSearchResultsToGoogleDataManager
  })
