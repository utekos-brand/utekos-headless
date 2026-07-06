import { defaultConsentState } from '@/components/cookie-consent/defaultConsentState'
import { createUsercentricsConsentState } from '@/components/cookie-consent/createUsercentricsConsentState'
import { parseUsercentricsAllowedDps } from '@/components/cookie-consent/parseUsercentricsAllowedDps'
import type { UsercentricsConsentState } from '@/components/cookie-consent/usercentricsConsentSchema'
import type { NextRequest } from 'next/server'

export function getRequestConsentState(request: NextRequest): UsercentricsConsentState {
  const allowedDps = parseUsercentricsAllowedDps(request.headers.get('cookie'))

  return allowedDps ? createUsercentricsConsentState(allowedDps) : defaultConsentState
}
