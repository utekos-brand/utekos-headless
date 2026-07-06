import type { NextRequest } from 'next/server'
import type { MiddlewareContext } from '@types'
import { isBlockedUserAgent } from '@/lib/middleware/guards/isBlockedUserAgent'

export function createMiddlewareContext(
  request: NextRequest
): MiddlewareContext {
  const userAgent = request.headers.get('user-agent') || ''
  const url = request.nextUrl
  const pathname = url.pathname

  return {
    userAgent,
    referer: request.headers.get('referer') || '',
    url,
    pathname,
    isProduction: process.env.NODE_ENV === 'production',
    isTargetRoute:
      !pathname.startsWith('/_next') && !pathname.startsWith('/api/internal'),
    isBlockedAgent: isBlockedUserAgent(userAgent)
  }
}
