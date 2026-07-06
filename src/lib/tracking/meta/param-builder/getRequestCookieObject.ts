import type { Cookies } from 'capi-param-builder-nodejs'
import type { NextRequest } from 'next/server'

export function getRequestCookieObject(request: NextRequest): Cookies {
  const cookies: Cookies = {}

  for (const cookie of request.cookies.getAll()) {
    cookies[cookie.name] = cookie.value
  }

  return cookies
}
