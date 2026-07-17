import type { CanonicalFormSubmit } from '../formSubmitEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalFormSubmitToGoogleDataManager(
  event: CanonicalFormSubmit
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'form_submit')
}
