import { canonicalAddToCartSchema } from '../../addToCartEvent'
import { createGoogleDataManagerProviderAdapter } from '../createGoogleDataManagerProviderAdapter'
import { dispatchCanonicalAddToCartToGoogleDataManager } from '../dispatchCanonicalAddToCartToGoogleDataManager'

export const googleDataManagerAddToCartProviderAdapter =
  createGoogleDataManagerProviderAdapter({
    dispatch: dispatchCanonicalAddToCartToGoogleDataManager,
    eventName: 'add_to_cart',
    key: 'google:add_to_cart',
    schema: canonicalAddToCartSchema
  })
