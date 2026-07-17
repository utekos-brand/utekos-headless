import type { CanonicalPageView } from '../pageViewEvent'
import {
  normalizeCanonicalPageView,
  type CanonicalPageViewRequestContext
} from './normalizeCanonicalPageView'
import { planCanonicalEventDispatch } from './planCanonicalEventDispatch'
import type {
  CanonicalEventStore,
  CanonicalEventStoreInput
} from './canonicalEventStore'

export type CanonicalPageViewStoreInput =
  CanonicalEventStoreInput & { event: CanonicalPageView }

export type CanonicalPageViewStore = CanonicalEventStore

type AcceptCanonicalPageViewInput = {
  payload: unknown
  requestContext: CanonicalPageViewRequestContext
  store: CanonicalPageViewStore
}

export type AcceptCanonicalPageViewResult =
  | { event_id: string; status: 'accepted' | 'duplicate' }
  | { reason: 'consent_denied'; status: 'rejected' }

export async function acceptCanonicalPageView(
  input: AcceptCanonicalPageViewInput
): Promise<AcceptCanonicalPageViewResult> {
  const event = normalizeCanonicalPageView(
    input.payload,
    input.requestContext
  )
  const hasPermittedPurpose =
    event.consent.analytics === 'granted' ||
    event.consent.marketing === 'granted'

  if (!hasPermittedPurpose) {
    return { reason: 'consent_denied', status: 'rejected' }
  }

  const result = await input.store.accept({
    dispatches: planCanonicalEventDispatch(event),
    event
  })

  return {
    event_id: event.event_id,
    status: result === 'inserted' ? 'accepted' : 'duplicate'
  }
}
