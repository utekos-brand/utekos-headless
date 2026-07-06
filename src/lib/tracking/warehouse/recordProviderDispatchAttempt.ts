import 'server-only'

import { getTrackingIdempotencyKey } from '@/lib/tracking/warehouse/getTrackingIdempotencyKey'
import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { ProviderDispatchAttemptInput } from 'types/tracking/event'

export async function recordProviderDispatchAttempt(
  input: ProviderDispatchAttemptInput
): Promise<void> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return
  }

  const idempotencyKey = getTrackingIdempotencyKey(input.eventName, input.eventId)
  const status =
    input.success ? 'succeeded'
    : input.retryable === false ? 'failed'
    : 'retry_scheduled'
  const nextAttemptAt = status === 'retry_scheduled' ? new Date(Date.now() + 60_000) : null

  await sql`
    insert into ops.provider_dispatch_attempts (
      idempotency_key,
      provider,
      event_id,
      event_name,
      status,
      attempt_count,
      next_attempt_at,
      last_error,
      processed_at
    )
    values (
      ${idempotencyKey},
      ${input.provider},
      ${input.eventId},
      ${input.eventName},
      ${status},
      1,
      ${nextAttemptAt},
      ${input.error ?? null},
      ${input.success ? new Date() : null}
    )
    on conflict (provider, idempotency_key) do update
    set
      status = case
        when excluded.status = 'succeeded' then 'succeeded'
        when excluded.status = 'failed' then 'failed'
        when ops.provider_dispatch_attempts.payload = '{}'::jsonb then 'failed'
        else 'retry_scheduled'
      end,
      attempt_count = ops.provider_dispatch_attempts.attempt_count + 1,
      next_attempt_at = case
        when excluded.status = 'succeeded' then null
        when excluded.status = 'failed' then null
        when ops.provider_dispatch_attempts.payload = '{}'::jsonb then null
        else excluded.next_attempt_at
      end,
      last_error = excluded.last_error,
      processed_at = excluded.processed_at,
      updated_at = now()
  `
}
