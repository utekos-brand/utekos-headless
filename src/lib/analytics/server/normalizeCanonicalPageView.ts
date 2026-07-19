import {
  canonicalPageViewSchema,
  type CanonicalPageView
} from '../pageViewEvent'

export type CanonicalPageViewRequestContext = {
  city?: string
  clientIpAddress?: string
  countryCode?: string
  postalCode?: string
  regionCode?: string
  userAgent?: string
}

export function normalizeCanonicalPageView(
  payload: unknown,
  requestContext: CanonicalPageViewRequestContext
): CanonicalPageView {
  const parsed = canonicalPageViewSchema.parse(payload)
  const {
    browser_id,
    click_id,
    client_ip_address: _clientIpAddress,
    event_device_info,
    external_id,
    impression_id,
    location: _location,
    region_code: _regionCode,
    user_data,
    ...event
  } = parsed
  const {
    user_agent: _userAgent,
    ...clientDeviceInfo
  } = event_device_info ?? {}
  const deviceInfo = {
    ...clientDeviceInfo,
    ...(requestContext.userAgent ?
      { user_agent: requestContext.userAgent }
    : {})
  }
  const location = {
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
  const hasLocation = Object.keys(location).length > 0
  const hasMarketingConsent = parsed.consent.marketing === 'granted'

  return canonicalPageViewSchema.parse({
    ...event,
    ...(hasDeviceInfo ? { event_device_info: deviceInfo } : {}),
    ...(requestContext.regionCode ?
      { region_code: requestContext.regionCode }
    : {}),
    ...(hasLocation ?
      { location: { ...location, source: 'ip_geolocation' } }
    : {}),
    ...(hasMarketingConsent && browser_id ? { browser_id } : {}),
    ...(hasMarketingConsent && click_id ? { click_id } : {}),
    ...(hasMarketingConsent && external_id ? { external_id } : {}),
    ...(hasMarketingConsent && impression_id ? { impression_id } : {}),
    ...(hasMarketingConsent && requestContext.clientIpAddress ?
      { client_ip_address: requestContext.clientIpAddress }
    : {}),
    ...(hasMarketingConsent && user_data ? { user_data } : {})
  })
}
