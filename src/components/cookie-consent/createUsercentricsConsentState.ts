import {
  USERCENTRICS_MARKETING_SERVICE_NAMES,
  USERCENTRICS_PREFERENCES_SERVICE_NAMES,
  USERCENTRICS_STATISTICS_SERVICE_NAMES
} from './usercentricsConfig'
import {
  usercentricsConsentSchema,
  type UsercentricsConsentState
} from './usercentricsConsentSchema'

function hasAnyServiceConsent(
  services: Record<string, boolean>,
  serviceNames: readonly string[]
): boolean {
  return serviceNames.some(serviceName => services[serviceName] === true)
}

export function createUsercentricsConsentState(
  services: Record<string, boolean> = {}
): UsercentricsConsentState {
  return usercentricsConsentSchema.parse({
    necessary: true,
    preferences: hasAnyServiceConsent(services, USERCENTRICS_PREFERENCES_SERVICE_NAMES),
    statistics: hasAnyServiceConsent(services, USERCENTRICS_STATISTICS_SERVICE_NAMES),
    marketing: hasAnyServiceConsent(services, USERCENTRICS_MARKETING_SERVICE_NAMES),
    services,
    source: 'usercentrics'
  })
}
