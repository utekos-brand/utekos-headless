import { canonicalSearchSchema } from '../../searchEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalSearchToGoogleDataManager } from '../dispatchCanonicalSearchToGoogleDataManager'

export const googleDataManagerSearchProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalSearchToGoogleDataManager,
    eventName: 'search',
    key: 'google:search',
    schema: canonicalSearchSchema
  })
