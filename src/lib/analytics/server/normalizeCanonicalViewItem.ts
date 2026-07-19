import {
  canonicalViewItemSchema,
  type CanonicalViewItem
} from '../viewItemEvent'
import type {
  CanonicalPageViewRequestContext
} from './normalizeCanonicalPageView'

export type CanonicalViewItemRequestContext =
  CanonicalPageViewRequestContext

export function normalizeCanonicalViewItem(
  payload: unknown,
  requestContext: CanonicalViewItemRequestContext
): CanonicalViewItem {
  const parsed = canonicalViewItemSchema.parse(payload)
  const normalized: CanonicalViewItem = { ...parsed }
  const clientLocation = parsed.location
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
  const mayUseBrowserLocation =
    parsed.consent.preferences === 'granted'
    && clientLocation?.source === 'browser_permission'
  const location =
    mayUseBrowserLocation ?
      clientLocation
    : Object.keys(serverLocation).length > 0 ?
      { ...serverLocation, source: 'ip_geolocation' as const }
    : undefined
  const hasDeviceInfo = Object.keys(deviceInfo).length > 0
  const hasMarketingConsent =
    parsed.consent.marketing === 'granted'

  if (hasDeviceInfo) normalized.event_device_info = deviceInfo
  if (requestContext.regionCode) {
    normalized.region_code = requestContext.regionCode
  }
  if (location) normalized.location = location

  if (!hasMarketingConsent) {
    const analyticsBrowserId = {
      ...(parsed.browser_id?.ga_client ?
        { ga_client: parsed.browser_id.ga_client }
      : {}),
      ...(parsed.browser_id?.ga_client_id ?
        { ga_client_id: parsed.browser_id.ga_client_id }
      : {}),
      ...(parsed.browser_id?.ga_cookie ?
        { ga_cookie: parsed.browser_id.ga_cookie }
      : {}),
      ...(parsed.browser_id?.ga_session_id ?
        { ga_session_id: parsed.browser_id.ga_session_id }
      : {})
    }

    if (
      parsed.consent.analytics === 'granted' &&
      Object.keys(analyticsBrowserId).length > 0
    ) {
      normalized.browser_id = analyticsBrowserId
    } else {
      delete normalized.browser_id
    }
    delete normalized.click_id
    delete normalized.external_id
    delete normalized.impression_id
    delete normalized.user_data
  } else if (requestContext.clientIpAddress) {
    normalized.client_ip_address = requestContext.clientIpAddress
  }

  return canonicalViewItemSchema.parse(normalized)
}
