// Path: src/lib/tracking/proxy/buildCookieConfigs.ts

import { MARKETING_CONFIG } from '@/api/constants/monitoring'
import { extractMarketingParams } from '@/lib/tracking/proxy/extractMarketingParams'
import { buildCookieConfigs } from '@/lib/tracking/proxy/buildCookieConfigs'
import { formatCookieHeader } from '@/lib/tracking/proxy/formatCookieHeader'
import type { NextRequest, NextResponse } from 'next/server'
export function handleMarketingParams(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const url = new URL(request.url)
  const isSecureConnection = url.protocol === 'https:'

  const marketingParams = extractMarketingParams(url.searchParams)

  if (Object.keys(marketingParams.all).length === 0) {
    return response
  }

  const existingFbc = request.cookies.get(MARKETING_CONFIG.fbc_cookie_name)
  if (marketingParams.fbclid && !marketingParams.fbc && existingFbc?.value) {
    const parts = existingFbc.value.split('.')
    if (parts.length === 4 && parts[3] === marketingParams.fbclid) {
      marketingParams.fbc = existingFbc.value
      marketingParams.all[MARKETING_CONFIG.fbc_param] = existingFbc.value
    }
  }

  const cookieConfigs = buildCookieConfigs(marketingParams, isSecureConnection)

  cookieConfigs.forEach(config => {
    const cookieHeader = formatCookieHeader(config)
    response.headers.append('Set-Cookie', cookieHeader)
  })

  response.headers.set(
    'X-Marketing-Params-Captured',
    Object.keys(marketingParams.all).join(',')
  )

  if (process.env.NODE_ENV === 'development') {
    console.log('[Marketing Params Captured]', {
      utm: marketingParams.utm,
      fbclid: marketingParams.fbclid,
      hasEmail: !!marketingParams.email,
      emailHashSet: !!marketingParams.emailHash,
      additionalParams: marketingParams.additionalParams,
      timestamp: marketingParams.timestamp
    })
  }

  return response
}
