import { canonicalBeginCheckoutSchema } from '../../beginCheckoutEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalBeginCheckoutToGoogleDataManager } from '../dispatchCanonicalBeginCheckoutToGoogleDataManager'

export const googleDataManagerBeginCheckoutProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalBeginCheckoutToGoogleDataManager,
    eventName: 'begin_checkout',
    key: 'google:begin_checkout',
    schema: canonicalBeginCheckoutSchema
  })
