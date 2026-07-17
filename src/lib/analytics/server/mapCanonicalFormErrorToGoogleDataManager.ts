import type { CanonicalFormError } from '../formErrorEvent'
import { mapCanonicalWebEventToGoogleDataManager } from './mapCanonicalWebEventToGoogleDataManager'

export function mapCanonicalFormErrorToGoogleDataManager(
  event: CanonicalFormError
) {
  return mapCanonicalWebEventToGoogleDataManager(event, 'form_error')
}
