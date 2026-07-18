import type { CanonicalPurchase } from '../purchaseEvent'
import type { CanonicalPurchaseRequestContext } from './normalizeCanonicalPurchase'

export function getVerifiedShopifyCustomerContext(
  event: CanonicalPurchase
): CanonicalPurchaseRequestContext {
  const location = event.location

  return {
    ...(location?.city ? { city: location.city } : {}),
    ...(event.client_ip_address ?
      { clientIpAddress: event.client_ip_address }
    : {}),
    ...(location?.country_code ?
      { countryCode: location.country_code }
    : {}),
    ...(location?.postal_code ?
      { postalCode: location.postal_code }
    : {}),
    ...(location?.region_code ?
      { regionCode: location.region_code }
    : {}),
    ...(event.event_device_info?.user_agent ?
      { userAgent: event.event_device_info.user_agent }
    : {})
  }
}
