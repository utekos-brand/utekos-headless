import {
  COOKIEBOT_MARKETING_SERVICE_NAMES,
  COOKIEBOT_PREFERENCES_SERVICE_NAMES,
  COOKIEBOT_STATISTICS_SERVICE_NAMES
} from './cookiebotConfig'
import {
  cookiebotConsentSchema,
  type CookiebotConsentState
} from './cookiebotConsentSchema'

type CookiebotCategories = {
  preferences?: boolean
  statistics?: boolean
  marketing?: boolean
}

function categoryServices(
  serviceNames: readonly string[],
  allowed: boolean
): Record<string, boolean> {
  return Object.fromEntries(serviceNames.map(serviceName => [serviceName, allowed]))
}

export function createCookiebotConsentState(
  categories: CookiebotCategories = {}
): CookiebotConsentState {
  const preferences = categories.preferences === true
  const statistics = categories.statistics === true
  const marketing = categories.marketing === true

  return cookiebotConsentSchema.parse({
    necessary: true,
    preferences,
    statistics,
    marketing,
    services: {
      ...categoryServices(COOKIEBOT_PREFERENCES_SERVICE_NAMES, preferences),
      ...categoryServices(COOKIEBOT_STATISTICS_SERVICE_NAMES, statistics),
      ...categoryServices(COOKIEBOT_MARKETING_SERVICE_NAMES, marketing)
    },
    source: 'cookiebot'
  })
}
