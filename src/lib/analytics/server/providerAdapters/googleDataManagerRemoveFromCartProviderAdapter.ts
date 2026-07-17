import { canonicalRemoveFromCartSchema } from '../../removeFromCartEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalRemoveFromCartToGoogleDataManager } from '../dispatchCanonicalRemoveFromCartToGoogleDataManager'

export const googleDataManagerRemoveFromCartProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalRemoveFromCartToGoogleDataManager,
    eventName: 'remove_from_cart',
    key: 'google:remove_from_cart',
    schema: canonicalRemoveFromCartSchema
  })
