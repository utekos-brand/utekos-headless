import { geolocation, ipAddress } from '@vercel/functions'
import type { CanonicalGenerateLeadRequestContext } from './normalizeCanonicalGenerateLead'

export function buildLeadRequestContextFromHeaders(
  requestHeaders: Headers
): CanonicalGenerateLeadRequestContext {
  const request = { headers: requestHeaders }
  const geo = geolocation(request)
  const clientIpAddress = ipAddress(requestHeaders)
  const userAgent = requestHeaders.get('user-agent') ?? undefined

  return {
    ...(geo.city ? { city: geo.city } : {}),
    ...(clientIpAddress ? { clientIpAddress } : {}),
    ...(geo.country ? { countryCode: geo.country } : {}),
    ...(geo.postalCode ? { postalCode: geo.postalCode } : {}),
    ...(geo.countryRegion ?
      { regionCode: geo.countryRegion }
    : {}),
    ...(userAgent ? { userAgent } : {})
  }
}
