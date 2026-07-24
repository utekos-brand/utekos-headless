import type { CanonicalRemoveFromCart } from '../removeFromCartEvent'
import { createCanonicalMetaDispatch } from './createCanonicalMetaDispatch'
import { mapCanonicalRemoveFromCartToMeta } from './mapCanonicalRemoveFromCartToMeta'

export const dispatchCanonicalRemoveFromCartToMeta =
  createCanonicalMetaDispatch<
    CanonicalRemoveFromCart,
    'remove_from_cart'
  >({
    eventName: 'remove_from_cart',
    mapEvent: mapCanonicalRemoveFromCartToMeta
  })
