import type { CanonicalRemoveFromCart } from '../removeFromCartEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalRemoveFromCartToGoogleDataManager } from './mapCanonicalRemoveFromCartToGoogleDataManager'

export const dispatchCanonicalRemoveFromCartToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalRemoveFromCart,
    'remove_from_cart'
  >({
    eventName: 'remove_from_cart',
    mapEvent: mapCanonicalRemoveFromCartToGoogleDataManager
  })
