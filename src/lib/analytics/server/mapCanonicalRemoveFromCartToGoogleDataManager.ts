import type { CanonicalRemoveFromCart } from '../removeFromCartEvent'
import { mapCanonicalCommerceEventToGoogleDataManager } from './mapCanonicalCommerceEventToGoogleDataManager'

export function mapCanonicalRemoveFromCartToGoogleDataManager(
  event: CanonicalRemoveFromCart
) {
  return mapCanonicalCommerceEventToGoogleDataManager(
    {
      ...event,
      // Webhook carts/update rows may omit page_url; Google DM still needs a location.
      page_url: event.page_url ?? 'https://utekos.no/'
    },
    'remove_from_cart'
  )
}
