import type { CanonicalFormError } from '../formErrorEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalFormErrorToGoogleDataManager } from './mapCanonicalFormErrorToGoogleDataManager'

export const dispatchCanonicalFormErrorToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalFormError,
    'form_error'
  >({
    eventName: 'form_error',
    mapEvent: mapCanonicalFormErrorToGoogleDataManager
  })
