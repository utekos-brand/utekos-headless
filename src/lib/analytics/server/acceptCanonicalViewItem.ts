import type { CanonicalEventStore } from './canonicalEventStore'
import type { CanonicalPageViewRequestContext } from './normalizeCanonicalPageView'
import { normalizeCanonicalViewItem } from './normalizeCanonicalViewItem'
import { planCanonicalPageViewDispatch } from './planCanonicalPageViewDispatch'

type AcceptCanonicalViewItemInput = {
  payload: unknown
  requestContext: CanonicalPageViewRequestContext
  store: CanonicalEventStore
}

export type AcceptCanonicalViewItemResult =
  | { event_id: string; status: 'accepted' | 'duplicate' }
  | { reason: 'consent_denied'; status: 'rejected' }

export async function acceptCanonicalViewItem(
  input: AcceptCanonicalViewItemInput
): Promise<AcceptCanonicalViewItemResult> {
  const event = normalizeCanonicalViewItem(
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
    dispatches: planCanonicalPageViewDispatch(event),
    event
  })

  return {
    event_id: event.event_id,
    status: result === 'inserted' ? 'accepted' : 'duplicate'
  }
}
