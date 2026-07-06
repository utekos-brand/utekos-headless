import type { NextRequest } from 'next/server'
import { extractEventCookies } from '@/lib/tracking/utils/extractEventCookies'
import { getClientIp } from '@/lib/tracking/user-data/getClientIp'
import type { EventCookies } from 'types/tracking/event/cookies/EventCookies'

export interface RequestEventContext {
  cookies: EventCookies
  clientIp: string
  userAgent: string
}

export function adaptRequestToEventContext(
  request: NextRequest
): RequestEventContext {
  const cookieMap = new Map<string, string>()
  request.cookies.getAll().forEach(c => cookieMap.set(c.name, c.value))
  const cookies = extractEventCookies(cookieMap)
  const clientIp = getClientIp(request) ?? ''
  const userAgent = request.headers.get('user-agent') ?? ''

  return {
    cookies,
    clientIp,
    userAgent
  }
}
