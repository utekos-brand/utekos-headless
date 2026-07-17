import type { CanonicalFormSubmit } from '../formSubmitEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalFormSubmitToGoogleDataManager } from './mapCanonicalFormSubmitToGoogleDataManager'

export const dispatchCanonicalFormSubmitToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalFormSubmit,
    'form_submit'
  >({
    eventName: 'form_submit',
    mapEvent: mapCanonicalFormSubmitToGoogleDataManager
  })
