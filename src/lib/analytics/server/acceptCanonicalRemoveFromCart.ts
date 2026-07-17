import type { CanonicalRemoveFromCart } from '../removeFromCartEvent'
import type { CanonicalEventStore } from './canonicalEventStore'
import {
  normalizeCanonicalRemoveFromCart,
  type CanonicalRemoveFromCartRequestContext
} from './normalizeCanonicalRemoveFromCart'
import { planCanonicalEventDispatch } from './planCanonicalEventDispatch'

export type CanonicalRemoveFromCartStore = CanonicalEventStore

type AcceptCanonicalRemoveFromCartInput = {
  payload: unknown
  requestContext: CanonicalRemoveFromCartRequestContext
  store: CanonicalRemoveFromCartStore
}

export type AcceptCanonicalRemoveFromCartResult =
  | { event_id: string; status: 'accepted' | 'duplicate' }
  | { reason: 'consent_denied'; status: 'rejected' }

export async function acceptCanonicalRemoveFromCart(
  input: AcceptCanonicalRemoveFromCartInput
): Promise<AcceptCanonicalRemoveFromCartResult> {
  const event = normalizeCanonicalRemoveFromCart(
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
