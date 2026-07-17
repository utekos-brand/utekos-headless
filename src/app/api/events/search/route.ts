import { geolocation, ipAddress } from '@vercel/functions'
import { after } from 'next/server'
import { handleCanonicalSearchRequest } from '@/lib/analytics/server/handleCanonicalSearchRequest'
import { handleCanonicalSearchRoute } from '@/lib/analytics/server/handleCanonicalSearchRoute'
import { postgresCanonicalEventStore } from '@/lib/analytics/server/postgresCanonicalPageViewStore'
import { runRegisteredProviderOutboxBatch } from '@/lib/analytics/server/runRegisteredProviderOutboxBatch'

export const maxDuration = 60

export function POST(request: Request) {
  return handleCanonicalSearchRoute(request, {
    collect: currentRequest =>
      handleCanonicalSearchRequest(currentRequest, {
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
      }),
    runBatch: runRegisteredProviderOutboxBatch,
    scheduleAfter: task => {
      after(task)
    }
  })
}
