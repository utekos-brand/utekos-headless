import { canonicalFormSubmitSchema } from '../../formSubmitEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalFormSubmitToGoogleDataManager } from '../dispatchCanonicalFormSubmitToGoogleDataManager'

export const googleDataManagerFormSubmitProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalFormSubmitToGoogleDataManager,
    eventName: 'form_submit',
    key: 'google:form_submit',
    schema: canonicalFormSubmitSchema
  })
