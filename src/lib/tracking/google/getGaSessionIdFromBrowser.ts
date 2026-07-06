import { getBrowserCookie } from './getBrowserCookie'

export function getGaSessionIdFromBrowser(): string | undefined {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.replace('G-', '')

  if (!measurementId) {
    return undefined
  }

  const sessionCookie = getBrowserCookie(`_ga_${measurementId}`)

  if (!sessionCookie) {
    return undefined
  }

  const parts = sessionCookie.split('.')

  return parts.length >= 3 ? parts[2] : undefined
}
