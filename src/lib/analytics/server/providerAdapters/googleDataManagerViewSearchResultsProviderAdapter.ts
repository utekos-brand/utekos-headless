import { canonicalViewSearchResultsSchema } from '../../viewSearchResultsEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalViewSearchResultsToGoogleDataManager } from '../dispatchCanonicalViewSearchResultsToGoogleDataManager'

export const googleDataManagerViewSearchResultsProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalViewSearchResultsToGoogleDataManager,
    eventName: 'view_search_results',
    key: 'google:view_search_results',
    schema: canonicalViewSearchResultsSchema
  })
