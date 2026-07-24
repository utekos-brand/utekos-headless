import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalRemoveFromCart } from '../removeFromCartEvent'
import { mapCanonicalCommerceEventToMeta } from './mapCanonicalCommerceEventToMeta'

export function mapCanonicalRemoveFromCartToMeta(
  event: CanonicalRemoveFromCart
): ServerEvent {
  return mapCanonicalCommerceEventToMeta(event, 'RemoveFromCart')
}
