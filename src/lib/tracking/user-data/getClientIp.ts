// Path: src/lib/tracking/user-data/getClientIp.ts

import type { NextRequest } from 'next/server'
export function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const candidates = forwardedFor
      .split(',')
      .map(ip => ip.trim())
      .filter(Boolean)
    const ipv6 = candidates.find(ip => ip.includes(':'))
    if (ipv6) return ipv6
    if (candidates.length > 0) return candidates[0] ?? null
  }

  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  const reqIp = (req as { ip?: string }).ip
  if (reqIp) return String(reqIp)

  return null
}
