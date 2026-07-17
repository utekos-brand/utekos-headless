import type { CanonicalSearch } from '../searchEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalSearchToGoogleDataManager(
  event: CanonicalSearch
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'search')
}
