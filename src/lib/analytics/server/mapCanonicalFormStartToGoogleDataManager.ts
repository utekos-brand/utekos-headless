import type { CanonicalFormStart } from '../formStartEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalFormStartToGoogleDataManager(
  event: CanonicalFormStart
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'form_start')
}
