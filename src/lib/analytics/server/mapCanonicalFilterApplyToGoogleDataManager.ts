import type { CanonicalFilterApply } from '../filterApplyEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalFilterApplyToGoogleDataManager(
  event: CanonicalFilterApply
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'filter_apply')
}
