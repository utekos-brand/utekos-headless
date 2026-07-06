import type { NextRequest } from 'next/server'

export function getRemoteAddress(request: NextRequest, fallbackClientIp: string): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const forwardedIp = forwardedFor?.split(',')[0]?.trim()

  return forwardedIp || fallbackClientIp || null
}
