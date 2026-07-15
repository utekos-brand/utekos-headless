import type { CanonicalPageView } from '../pageViewEvent'
import {
  normalizeCanonicalPageView,
  type CanonicalPageViewRequestContext
} from './normalizeCanonicalPageView'
import {
  planCanonicalPageViewDispatch,
  type ProviderDispatchIntent
} from './planCanonicalPageViewDispatch'

export type CanonicalPageViewStoreInput = {
  dispatches: ProviderDispatchIntent[]
  event: CanonicalPageView
}

export type CanonicalPageViewStore = {
  accept: (
    input: CanonicalPageViewStoreInput
  ) => Promise<'duplicate' | 'inserted'>
}

type AcceptCanonicalPageViewInput = {
  payload: unknown
  requestContext: CanonicalPageViewRequestContext
  store: CanonicalPageViewStore
}

export type AcceptCanonicalPageViewResult =
  | {
      event_id: string
      status: 'accepted' | 'duplicate'
    }
  | {
      reason: 'consent_denied'
      status: 'rejected'
    }

export async function acceptCanonicalPageView(
  input: AcceptCanonicalPageViewInput
): Promise<AcceptCanonicalPageViewResult> {
  const event = normalizeCanonicalPageView(
    input.payload,
    input.requestContext
  )
  const hasPermittedPurpose =
    event.consent.analytics === 'granted'
    || event.consent.marketing === 'granted'

  if (!hasPermittedPurpose) {
    return {
      reason: 'consent_denied',
      status: 'rejected'
    }
  }

  const result = await input.store.accept({
    dispatches: planCanonicalPageViewDispatch(event),
    event
  })

  return {
    event_id: event.event_id,
    status: result === 'inserted' ? 'accepted' : 'duplicate'
  }
}
