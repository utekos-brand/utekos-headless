import 'server-only'

import { headers } from 'next/headers'
import type { CanonicalGenerateLeadRequestContext } from './normalizeCanonicalGenerateLead'

function firstHeaderValue(value: string | null): string | undefined {
  if (!value) return undefined
  const first = value.split(',')[0]?.trim()
  return first && first.length > 0 ? first : undefined
}

export async function getLeadRequestContextFromHeaders(): Promise<CanonicalGenerateLeadRequestContext> {
  const requestHeaders = await headers()
  const clientIpAddress = firstHeaderValue(
    requestHeaders.get('x-forwarded-for')
  )
  const userAgent = requestHeaders.get('user-agent') ?? undefined
  const city = requestHeaders.get('x-vercel-ip-city') ?? undefined
  const countryCode =
    requestHeaders.get('x-vercel-ip-country') ?? undefined
  const postalCode =
    requestHeaders.get('x-vercel-ip-postal-code') ?? undefined
  const regionCode =
    requestHeaders.get('x-vercel-ip-country-region') ?? undefined

  return {
    ...(city ? { city: decodeURIComponent(city) } : {}),
    ...(clientIpAddress ? { clientIpAddress } : {}),
    ...(countryCode ? { countryCode } : {}),
    ...(postalCode ? { postalCode } : {}),
    ...(regionCode ? { regionCode } : {}),
    ...(userAgent ? { userAgent } : {})
  }
}
