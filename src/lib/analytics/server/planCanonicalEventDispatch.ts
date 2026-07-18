import type { CanonicalEvent } from '../canonicalEvent'
import {
  getEventCatalogEntry,
  type ProviderId as CatalogProviderId
} from '../eventCatalog'
import type { ProviderId } from './providerAdapter'
import { findGoogleClientId } from './findGoogleClientId'

type ActiveProviderDispatchIntent = {
  dispatch_mode: 'server_retry'
  event_id: string
  provider: ProviderId
}

type SkippedProviderDispatchIntent = ActiveProviderDispatchIntent & {
  skip_reason: 'missing_client_id'
  status: 'skipped_unqualified'
}

export type ProviderDispatchIntent =
  | ActiveProviderDispatchIntent
  | SkippedProviderDispatchIntent

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
      // Transaction events (purchase/refund) are operationally
      // eligible for outbox planning; provider-specific analytics
      // or marketing gates still apply via their own requirements.
      return true
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

    if (
      provider === 'google'
      && !findGoogleClientId(event.browser_id)
    ) {
      return [
        {
          dispatch_mode: 'server_retry' as const,
          event_id: event.event_id,
          provider,
          skip_reason: 'missing_client_id' as const,
          status: 'skipped_unqualified' as const
        }
      ]
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
