import type { CookieSettings } from 'capi-param-builder-nodejs'
import type { NextResponse } from 'next/server'

function getCookieDomain(domain: string): string | undefined {
  if (!domain || domain === 'localhost' || domain.includes(':')) {
    return undefined
  }

  return domain
}

export function setMetaParamBuilderCookies(
  response: NextResponse,
  cookiesToSet: CookieSettings[]
): void {
  for (const cookie of cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, {
      domain: getCookieDomain(cookie.domain),
      httpOnly: false,
      maxAge: cookie.maxAge,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
  }
}
