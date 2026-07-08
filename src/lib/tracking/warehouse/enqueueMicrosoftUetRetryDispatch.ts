import 'server-only'

import { getTrackingIdempotencyKey } from '@/lib/tracking/warehouse/getTrackingIdempotencyKey'
import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { MetaEventPayload } from 'types/tracking/meta'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import type postgres from 'postgres'

export async function enqueueMicrosoftUetRetryDispatch(
  payload: MetaEventPayload,
  attribution: CheckoutAttribution
): Promise<void> {
  const sql = getTrackingWarehouse()
  const eventId = payload.eventId
  const eventName = payload.eventName

  if (!sql || !eventId || !eventName) {
    return
  }

  const idempotencyKey = getTrackingIdempotencyKey(eventName, eventId)
  const queuedPayload = {
    trackingPayload: payload,
    attribution
  }

  await sql`
    insert into ops.provider_dispatch_attempts (
      idempotency_key,
      provider,
      event_id,
      event_name,
      payload,
      consent_basis,
      data_quality,
      status,
      dispatch_mode,
      attempt_count,
      next_attempt_at,
      last_error,
      processed_at,
      response
    )
    values (
      ${idempotencyKey},
      'microsoft_uet',
      ${eventId},
      ${eventName},
      ${sql.json(queuedPayload as postgres.JSONValue)},
      '{}'::jsonb,
      '{}'::jsonb,
      'pending',
      'server_retry',
      0,
      now(),
      null,
      null,
      '{}'::jsonb
    )
    on conflict (provider, idempotency_key) do update
    set
      event_id = excluded.event_id,
      event_name = excluded.event_name,
      payload = excluded.payload,
      status = 'pending',
      dispatch_mode = 'server_retry',
      attempt_count = 0,
      next_attempt_at = now(),
      last_error = null,
      processed_at = null,
      response = '{}'::jsonb,
      updated_at = now()
    where ops.provider_dispatch_attempts.status not in ('succeeded', 'skipped_unqualified')
  `
}
