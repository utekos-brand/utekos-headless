import { parseGaSessionId } from './parseGaSessionId'

export function parseSessionIdFromGaContainerCookie(cookieValue?: string) {
  const parsed = parseGaSessionId(cookieValue)
  if (!parsed) return undefined

  const numericValue = Number(parsed)
  return Number.isFinite(numericValue) ? numericValue : undefined
}