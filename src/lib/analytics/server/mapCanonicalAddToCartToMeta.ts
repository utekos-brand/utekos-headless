import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalAddToCart } from '../addToCartEvent'
import { mapCanonicalCommerceEventToMeta } from './mapCanonicalCommerceEventToMeta'

export function mapCanonicalAddToCartToMeta(
  event: CanonicalAddToCart
): ServerEvent {
  return mapCanonicalCommerceEventToMeta(event, 'AddToCart')
}
