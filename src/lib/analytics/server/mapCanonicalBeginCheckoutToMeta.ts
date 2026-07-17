import type { ServerEvent } from 'facebook-nodejs-business-sdk'
import type { CanonicalBeginCheckout } from '../beginCheckoutEvent'
import { mapCanonicalCommerceEventToMeta } from './mapCanonicalCommerceEventToMeta'

export function mapCanonicalBeginCheckoutToMeta(
  event: CanonicalBeginCheckout
): ServerEvent {
  return mapCanonicalCommerceEventToMeta(event, 'InitiateCheckout')
}
