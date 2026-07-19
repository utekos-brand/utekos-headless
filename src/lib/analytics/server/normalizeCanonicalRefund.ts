import {
  canonicalRefundSchema,
  type CanonicalRefund
} from '../refundEvent'
import type { CanonicalPurchaseRequestContext } from './normalizeCanonicalPurchase'

export type CanonicalRefundRequestContext =
  CanonicalPurchaseRequestContext

export function normalizeCanonicalRefund(
  payload: unknown,
  requestContext: CanonicalRefundRequestContext
): CanonicalRefund {
  const parsed = canonicalRefundSchema.parse(payload)
  const normalized = { ...parsed }
  const deviceInfo = { ...parsed.event_device_info }

  delete normalized.client_ip_address
  delete normalized.event_device_info
  delete normalized.location
  delete normalized.region_code
  delete deviceInfo.user_agent

  Object.assign(deviceInfo, {
    ...(requestContext.userAgent ?
      { user_agent: requestContext.userAgent }
    : {})
  })

  const serverLocation = {
    ...(requestContext.city ? { city: requestContext.city } : {}),
    ...(requestContext.countryCode ?
      { country_code: requestContext.countryCode.toUpperCase() }
    : {}),
    ...(requestContext.postalCode ?
      { postal_code: requestContext.postalCode }
    : {}),
    ...(requestContext.regionCode ?
      { region_code: requestContext.regionCode }
    : {})
  }

  const hasDeviceInfo = Object.keys(deviceInfo).length > 0
  const hasLocation = Object.keys(serverLocation).length > 0
  const preservedClientIp =
    parsed.client_ip_address ?? requestContext.clientIpAddress

  if (hasDeviceInfo) normalized.event_device_info = deviceInfo
  if (requestContext.regionCode) {
    normalized.region_code = requestContext.regionCode
  }
  if (hasLocation) {
    normalized.location = {
      ...serverLocation,
      source: 'ip_geolocation'
    }
  }

  if (preservedClientIp) {
    normalized.client_ip_address = preservedClientIp
  }

  delete normalized.browser_id
  delete normalized.click_id
  delete normalized.external_id
  delete normalized.impression_id
  delete normalized.user_data

  return canonicalRefundSchema.parse(normalized)
}
