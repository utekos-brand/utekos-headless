import type { CanonicalEvent } from '../canonicalEvent'
import {
  getEventCatalogEntry,
  type ProviderId as CatalogProviderId
} from '../eventCatalog'
import type { ProviderId } from './providerAdapter'

export type ProviderDispatchIntent = {
  dispatch_mode: 'server_retry'
  event_id: string
  provider: ProviderId
}

const outboxProviderIds = [
  'google',
  'meta',
  'microsoft_uet'
] as const satisfies readonly ProviderId[]

function hasRequiredConsent(
  requirement:
    ReturnType<typeof getEventCatalogEntry>['providers'][CatalogProviderId]['consentRequirement'],
  event: CanonicalEvent
) {
  switch (requirement) {
    case 'analytics':
      return event.consent.analytics === 'granted'
    case 'marketing':
      return event.consent.marketing === 'granted'
    case 'analytics_or_marketing':
      return (
        event.consent.analytics === 'granted' ||
        event.consent.marketing === 'granted'
      )
    case 'analytics_or_operational':
      return event.consent.analytics === 'granted'
    case 'none':
      return true
    case 'operational':
      return false
  }
}

export function planCanonicalEventDispatch(
  event: CanonicalEvent
): ProviderDispatchIntent[] {
  const catalogEntry = getEventCatalogEntry(event.event_name)

  if (catalogEntry.lifecycle !== 'active') return []

  return outboxProviderIds.flatMap(provider => {
    const providerEntry = catalogEntry.providers[provider]

    if (providerEntry.serverOutbox !== 'active') return []
    if (
      providerEntry.support !== 'supported' ||
      providerEntry.productionStatus !== 'active'
    ) {
      throw new Error(
        `${provider}:${event.event_name} has an inconsistent active outbox catalog entry`
      )
    }
    if (!hasRequiredConsent(providerEntry.consentRequirement, event)) {
      return []
    }

    return [
      {
        dispatch_mode: 'server_retry' as const,
        event_id: event.event_id,
        provider
      }
    ]
  })
}
