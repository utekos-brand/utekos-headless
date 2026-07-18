import type { CanonicalEventEnvelope } from '../canonicalEventEnvelope'

const GA_CLIENT_ID = /^\d+\.\d+$/
const GA_COOKIE = /^GA\d+\.\d+\.(\d+\.\d+)$/

export function findGoogleClientId(
  browserId: CanonicalEventEnvelope['browser_id']
) {
  const candidate =
    browserId?.ga_client_id
    ?? browserId?.ga_client
    ?? browserId?.ga_cookie

  if (!candidate) return undefined

  const normalized = candidate.trim()
  if (GA_CLIENT_ID.test(normalized)) return normalized

  return GA_COOKIE.exec(normalized)?.[1]
}
