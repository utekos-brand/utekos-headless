import type { NextRequest } from 'next/server'
import { getRequestConsentState } from './getRequestConsentState'

export function hasRequestMarketingConsent(request: NextRequest): boolean {
  return getRequestConsentState(request).marketing
}
