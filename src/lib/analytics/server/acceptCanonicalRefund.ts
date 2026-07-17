import type { CanonicalEvent } from '../canonicalEvent'
import type { CanonicalRefund } from '../refundEvent'
import type { CanonicalEventStore } from './canonicalEventStore'
import {
  normalizeCanonicalRefund,
  type CanonicalRefundRequestContext
} from './normalizeCanonicalRefund'
import { planCanonicalEventDispatch } from './planCanonicalEventDispatch'

export type CanonicalRefundStore = CanonicalEventStore

type AcceptCanonicalRefundInput = {
  payload: unknown
  requestContext: CanonicalRefundRequestContext
  store: CanonicalRefundStore
}

export type AcceptCanonicalRefundResult = {
  event_id: string
  status: 'accepted' | 'duplicate'
}

export async function acceptCanonicalRefund(
  input: AcceptCanonicalRefundInput
): Promise<AcceptCanonicalRefundResult> {
  const event = normalizeCanonicalRefund(
    input.payload,
    input.requestContext
  )
  const storedEvent = event as unknown as CanonicalEvent
  const result = await input.store.accept({
    dispatches: planCanonicalEventDispatch(storedEvent),
    event: storedEvent
  })

  return {
    event_id: event.event_id,
    status: result === 'inserted' ? 'accepted' : 'duplicate'
  }
}
