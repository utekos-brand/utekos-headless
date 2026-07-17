import type { CanonicalViewCart } from '../viewCartEvent'
import { mapCanonicalCommerceEventToGoogleDataManager } from './mapCanonicalCommerceEventToGoogleDataManager'

export function mapCanonicalViewCartToGoogleDataManager(
  event: CanonicalViewCart
) {
  return mapCanonicalCommerceEventToGoogleDataManager(
    event,
    'view_cart'
  )
}
