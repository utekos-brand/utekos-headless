import { geolocation, ipAddress } from '@vercel/functions'
import { handleCanonicalViewItemRequest } from '@/lib/analytics/server/handleCanonicalViewItemRequest'
import { postgresCanonicalEventStore } from '@/lib/analytics/server/postgresCanonicalPageViewStore'

export const runtime = 'nodejs'
export const maxDuration = 10

export function POST(request: Request) {
  return handleCanonicalViewItemRequest(request, {
    getRequestContext: currentRequest => {
      const geo = geolocation(currentRequest)
      const clientIpAddress = ipAddress(currentRequest)
      const userAgent = currentRequest.headers.get('user-agent')

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
}
