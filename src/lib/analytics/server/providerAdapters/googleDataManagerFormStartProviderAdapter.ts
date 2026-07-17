import { canonicalFormStartSchema } from '../../formStartEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalFormStartToGoogleDataManager } from '../dispatchCanonicalFormStartToGoogleDataManager'

export const googleDataManagerFormStartProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalFormStartToGoogleDataManager,
    eventName: 'form_start',
    key: 'google:form_start',
    schema: canonicalFormStartSchema
  })
