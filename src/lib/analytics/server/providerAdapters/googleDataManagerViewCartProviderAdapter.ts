import { canonicalViewCartSchema } from '../../viewCartEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalViewCartToGoogleDataManager } from '../dispatchCanonicalViewCartToGoogleDataManager'

export const googleDataManagerViewCartProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalViewCartToGoogleDataManager,
    eventName: 'view_cart',
    key: 'google:view_cart',
    schema: canonicalViewCartSchema
  })
