import { geolocation, ipAddress } from '@vercel/functions'
import { handleCanonicalPageViewRequest } from '@/lib/analytics/server/handleCanonicalPageViewRequest'
import { handleCanonicalPageViewRoute } from '@/lib/analytics/server/handleCanonicalPageViewRoute'
import { postgresCanonicalPageViewStore } from '@/lib/analytics/server/postgresCanonicalPageViewStore'

export const maxDuration = 60

export function POST(request: Request) {
  return handleCanonicalPageViewRoute(request, {
    collect: currentRequest =>
      handleCanonicalPageViewRequest(currentRequest, {
        getRequestContext: requestWithContext => {
          const geo = geolocation(requestWithContext)
          const clientIpAddress = ipAddress(requestWithContext)
          const userAgent =
            requestWithContext.headers.get('user-agent')
          const cookieHeader =
            requestWithContext.headers.get('cookie') ?? undefined

          return {
            ...(geo.city ? { city: geo.city } : {}),
            ...(clientIpAddress ? { clientIpAddress } : {}),
            ...(cookieHeader ? { cookieHeader } : {}),
            ...(geo.country ? { countryCode: geo.country } : {}),
            ...(geo.postalCode ?
              { postalCode: geo.postalCode }
            : {}),
            ...(geo.countryRegion ?
              { regionCode: geo.countryRegion }
            : {}),
            requestUrl: requestWithContext.url,
            ...(userAgent ? { userAgent } : {})
          }
        },
        store: postgresCanonicalPageViewStore
      })
  })
}
