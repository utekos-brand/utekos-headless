import type { CanonicalViewSearchResults } from '../viewSearchResultsEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalViewSearchResultsToGoogleDataManager(
  event: CanonicalViewSearchResults
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'view_search_results')
}
