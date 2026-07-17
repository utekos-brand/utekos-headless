import { canonicalFormErrorSchema } from '../../formErrorEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalFormErrorToGoogleDataManager } from '../dispatchCanonicalFormErrorToGoogleDataManager'

export const googleDataManagerFormErrorProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalFormErrorToGoogleDataManager,
    eventName: 'form_error',
    key: 'google:form_error',
    schema: canonicalFormErrorSchema
  })
