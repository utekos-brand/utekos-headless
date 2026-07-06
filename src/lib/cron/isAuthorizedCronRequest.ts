import type { NextRequest } from 'next/server'

export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    return false
  }

  const authorizationHeader = request.headers.get('authorization')
  const queryKey = new URL(request.url).searchParams.get('key')

  return authorizationHeader === `Bearer ${secret}` || queryKey === secret
}
