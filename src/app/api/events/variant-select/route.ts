import { geolocation, ipAddress } from '@vercel/functions'
import { handleCanonicalVariantSelectRequest } from '@/lib/analytics/server/handleCanonicalVariantSelectRequest'
import { handleCanonicalVariantSelectRoute } from '@/lib/analytics/server/handleCanonicalVariantSelectRoute'
import { postgresCanonicalEventStore } from '@/lib/analytics/server/postgresCanonicalPageViewStore'

export const maxDuration = 60

export function POST(request: Request) {
  return handleCanonicalVariantSelectRoute(request, {
    collect: currentRequest =>
      handleCanonicalVariantSelectRequest(currentRequest, {
        getRequestContext: requestWithContext => {
          const geo = geolocation(requestWithContext)
          const clientIpAddress = ipAddress(requestWithContext)
          const userAgent =
            requestWithContext.headers.get('user-agent')

          return {
            ...(geo.city ? { city: geo.city } : {}),
            ...(clientIpAddress ? { clientIpAddress } : {}),
            ...(geo.country ? { countryCode: geo.country } : {}),
            ...(geo.postalCode ?
              { postalCode: geo.postalCode }
            : {}),
            ...(geo.countryRegion ?
              { regionCode: geo.countryRegion }
            : {}),
            ...(userAgent ? { userAgent } : {})
          }
        },
        store: postgresCanonicalEventStore
      })
  })
}
