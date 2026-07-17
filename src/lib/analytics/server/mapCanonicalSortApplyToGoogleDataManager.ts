import type { CanonicalSortApply } from '../sortApplyEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalSortApplyToGoogleDataManager(
  event: CanonicalSortApply
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'sort_apply')
}
