import { canonicalScrollDepthSchema } from '../../scrollDepthEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalScrollDepthToGoogleDataManager } from '../dispatchCanonicalScrollDepthToGoogleDataManager'

export const googleDataManagerScrollDepthProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalScrollDepthToGoogleDataManager,
    eventName: 'scroll_depth',
    key: 'google:scroll_depth',
    schema: canonicalScrollDepthSchema
  })
