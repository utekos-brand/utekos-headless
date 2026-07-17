import type { CanonicalViewCart } from '../viewCartEvent'
import { createCanonicalGoogleDataManagerDispatch } from './createCanonicalGoogleDataManagerDispatch'
import { mapCanonicalViewCartToGoogleDataManager } from './mapCanonicalViewCartToGoogleDataManager'

export const dispatchCanonicalViewCartToGoogleDataManager =
  createCanonicalGoogleDataManagerDispatch<
    CanonicalViewCart,
    'view_cart'
  >({
    eventName: 'view_cart',
    mapEvent: mapCanonicalViewCartToGoogleDataManager
  })
