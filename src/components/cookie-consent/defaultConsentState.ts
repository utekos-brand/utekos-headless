import type { UsercentricsConsentState } from './usercentricsConsentSchema'

export const defaultConsentState: UsercentricsConsentState = {
  necessary: true,
  preferences: false,
  statistics: false,
  marketing: false,
  services: {},
  source: 'usercentrics'
}
