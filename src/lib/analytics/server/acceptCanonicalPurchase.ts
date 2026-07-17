import type { CanonicalPurchase } from '../purchaseEvent'
import type { CanonicalEventStore } from './canonicalEventStore'
import {
  normalizeCanonicalPurchase,
  type CanonicalPurchaseRequestContext
} from './normalizeCanonicalPurchase'
import { planCanonicalEventDispatch } from './planCanonicalEventDispatch'

export type CanonicalPurchaseStore = CanonicalEventStore

type AcceptCanonicalPurchaseInput = {
  payload: unknown
  requestContext: CanonicalPurchaseRequestContext
  store: CanonicalPurchaseStore
}

export type AcceptCanonicalPurchaseResult = {
  event_id: string
  status: 'accepted' | 'duplicate'
}

export async function acceptCanonicalPurchase(
  input: AcceptCanonicalPurchaseInput
): Promise<AcceptCanonicalPurchaseResult> {
  const event = normalizeCanonicalPurchase(
    input.payload,
    input.requestContext
  )
  const result = await input.store.accept({
    dispatches: planCanonicalEventDispatch(event),
    event: event as CanonicalPurchase
  })

  return {
    event_id: event.event_id,
    status: result === 'inserted' ? 'accepted' : 'duplicate'
  }
}
