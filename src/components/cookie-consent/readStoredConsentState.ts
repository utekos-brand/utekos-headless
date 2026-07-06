import { createUsercentricsConsentState } from './createUsercentricsConsentState'
import { parseUsercentricsAllowedDps, parseUsercentricsAllowedDpsValue } from './parseUsercentricsAllowedDps'
import type { UsercentricsConsentState } from './usercentricsConsentSchema'

export function readStoredConsentState(): UsercentricsConsentState | null {
  if (typeof window === 'undefined') {
    return null
  }

  const allowedDps =
    typeof window.ucConsentAllowedDpsString === 'string' ?
      parseUsercentricsAllowedDpsValue(window.ucConsentAllowedDpsString)
    : parseUsercentricsAllowedDps(document.cookie)

  return allowedDps ? createUsercentricsConsentState(allowedDps) : null
}
