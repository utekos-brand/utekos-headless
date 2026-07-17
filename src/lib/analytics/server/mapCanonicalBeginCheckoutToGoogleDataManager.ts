import type { CanonicalBeginCheckout } from '../beginCheckoutEvent'
import { mapCanonicalCommerceEventToGoogleDataManager } from './mapCanonicalCommerceEventToGoogleDataManager'

export function mapCanonicalBeginCheckoutToGoogleDataManager(
  event: CanonicalBeginCheckout
) {
  return mapCanonicalCommerceEventToGoogleDataManager(
    event,
    'begin_checkout'
  )
}
