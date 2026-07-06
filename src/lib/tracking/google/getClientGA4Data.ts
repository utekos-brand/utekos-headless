import { getGaClientIdFromBrowser } from './getGaClientIdFromBrowser'
import { getGaSessionIdFromBrowser } from './getGaSessionIdFromBrowser'
import type { GA4DataPayload } from 'types/tracking/google/GA4DataPayload'

export function getClientGA4Data(): GA4DataPayload | undefined {
  const clientId = getGaClientIdFromBrowser()
  const sessionId = getGaSessionIdFromBrowser()

  if (!clientId && !sessionId) {
    return undefined
  }

  return {
    ...(clientId ? { client_id: clientId } : {}),
    ...(sessionId ? { session_id: sessionId } : {})
  }
}
