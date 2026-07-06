// src/proxy.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareContext } from '@/lib/middleware/utils/createMiddlewareContext'
import { detectAdInteractions } from '@/lib/middleware/services/detectAdInteractions'
import { planMiddlewareActions } from '@/lib/middleware/services/planMiddlewareActions'
import { applyResponseCookies } from '@/lib/middleware/infrastructure/applyResponseCookies'
import { dispatchAnalyticsLogs } from '@/lib/middleware/infrastructure/dispatchAnalyticsLogs'
import { runProxyPipeline } from '@/lib/middleware/services/runProxyPipeline'
import { handleMarketingParams } from './lib/tracking/proxy/handleMarketingParams'
import { extractMarketingParams } from './lib/tracking/proxy/extractMarketingParams'
import { buildCookieConfigs } from './lib/tracking/proxy/buildCookieConfigs'
import { formatCookieHeader } from './lib/tracking/proxy/formatCookieHeader'
import { hashEmail } from './lib/tracking/hash/hashEmail'
import { formatFbcCookie } from './lib/tracking/proxy/formatFbcCookie'
import { hasRequestMarketingConsent } from '@/lib/tracking/consent/hasRequestMarketingConsent'

const allowedReferrers = new Set(['nbocc.no', 'bergenhordaland.nbocc.no'])

const NBCC_DESTINATION_PATH = '/nbcc'

const MAGASINET_UPGRADE_ENABLED = true
const MAGASINET_UPGRADE_PATH = '/magasinet/oppgradering'

function isAllowedNboccReferrer(request: NextRequest) {
  const referer = request.headers.get('referer')

  if (!referer) {
    return false
  }

  try {
    const refererUrl = new URL(referer)
    const hostname = refererUrl.hostname.replace(/^www\./, '')

    return allowedReferrers.has(hostname)
  } catch {
    return false
  }
}

function continueDocumentRequest(): NextResponse {
  return NextResponse.next()
}

export async function proxy(request: NextRequest) {
  const context = createMiddlewareContext(request)

  if (context.isBlockedAgent) {
    return new NextResponse(null, { status: 403, statusText: 'Forbidden' })
  }

  if (context.pathname === '/' && isAllowedNboccReferrer(request)) {
    const redirectUrl = new URL(NBCC_DESTINATION_PATH, request.url)

    redirectUrl.search = request.nextUrl.search

    return NextResponse.redirect(redirectUrl, 307)
  }

  if (MAGASINET_UPGRADE_ENABLED && context.pathname.startsWith('/magasinet')) {
    if (
      context.pathname === MAGASINET_UPGRADE_PATH
      || context.pathname.startsWith(`${MAGASINET_UPGRADE_PATH}/`)
    ) {
      return continueDocumentRequest()
    }

    const upgradeUrl = new URL(MAGASINET_UPGRADE_PATH, request.url)
    return NextResponse.redirect(upgradeUrl)
  }

  if (!context.isTargetRoute) {
    return continueDocumentRequest()
  }

  if (!hasRequestMarketingConsent(request)) {
    return continueDocumentRequest()
  }

  return runProxyPipeline(request, context, {
    detectInteractions: detectAdInteractions,
    planActions: planMiddlewareActions,
    applyCookies: applyResponseCookies,
    dispatchLogs: dispatchAnalyticsLogs,
    legacyHandler: async (req, res) => handleMarketingParams(req, res)
  })
}

export const config = {
  matcher: [
    '/((?!api|sporing|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|videos|apple-icon|icon|manifest).*)'
  ]
}

export {
  handleMarketingParams,
  extractMarketingParams,
  buildCookieConfigs,
  formatCookieHeader,
  hashEmail,
  formatFbcCookie
}
