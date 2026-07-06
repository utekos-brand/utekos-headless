import { readStoredConsentState } from '@/components/cookie-consent/readStoredConsentState'
import { getLatestConsentServices } from './latestConsentServices'

export function hasServiceConsent(serviceName: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  if (getLatestConsentServices()?.[serviceName] === true) {
    return true
  }

  return readStoredConsentState()?.services[serviceName] === true
}
