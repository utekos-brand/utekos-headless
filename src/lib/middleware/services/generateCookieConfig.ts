import type { MiddlewareCookieConfig } from '@types'

export function generateCookieConfig(
  name: string,
  value: string,
  isProduction: boolean
): MiddlewareCookieConfig {
  const MAX_AGE_SECONDS = 30 * 24 * 60 * 60

  return {
    name,
    value,
    options: {
      path: '/',
      secure: isProduction,
      httpOnly: false,
      sameSite: 'lax',
      maxAge: MAX_AGE_SECONDS
    }
  }
}
