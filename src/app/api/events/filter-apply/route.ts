import { geolocation, ipAddress } from '@vercel/functions'
import { handleCanonicalFilterApplyRequest } from '@/lib/analytics/server/handleCanonicalFilterApplyRequest'
import { handleCanonicalFilterApplyRoute } from '@/lib/analytics/server/handleCanonicalFilterApplyRoute'
import { postgresCanonicalEventStore } from '@/lib/analytics/server/postgresCanonicalPageViewStore'

export const maxDuration = 60

export function POST(request: Request) {
  return handleCanonicalFilterApplyRoute(request, {
    collect: currentRequest =>
      handleCanonicalFilterApplyRequest(currentRequest, {
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
