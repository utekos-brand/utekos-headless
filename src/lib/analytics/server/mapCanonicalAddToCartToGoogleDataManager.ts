import type { CanonicalAddToCart } from '../addToCartEvent'
import { mapCanonicalCommerceEventToGoogleDataManager } from './mapCanonicalCommerceEventToGoogleDataManager'

export function mapCanonicalAddToCartToGoogleDataManager(
  event: CanonicalAddToCart
) {
  return mapCanonicalCommerceEventToGoogleDataManager(
    event,
    'add_to_cart'
  )
}
