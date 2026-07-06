// Path: src/lib/middleware/infrastructure/applyResponseCookies.ts

import type { NextResponse } from 'next/server'
import type { MiddlewareCookieConfig } from '@types'

export function applyResponseCookies(
  response: NextResponse,
  cookies: MiddlewareCookieConfig[]
): void {
  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  }
}
