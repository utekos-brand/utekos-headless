import 'server-only'

import { getTrackingIdempotencyKey } from '@/lib/tracking/warehouse/getTrackingIdempotencyKey'
import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { ProviderDispatchAttemptInput } from 'types/tracking/event'
import { getProviderDispatchStatus } from '@/lib/tracking/warehouse/getProviderDispatchStatus'

export async function recordProviderDispatchAttempt(
  input: ProviderDispatchAttemptInput
): Promise<void> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return
  }

  const idempotencyKey = getTrackingIdempotencyKey(input.eventName, input.eventId)
  const dispatchMode = input.dispatchMode ?? 'server_retry'
  const status = getProviderDispatchStatus({
    success: input.success,
    ...(input.skipped !== undefined ? { skipped: input.skipped } : {}),
    ...(input.retryable !== undefined ? { retryable: input.retryable } : {}),
    dispatchMode,
    ...(input.verification ? { verification: input.verification } : {})
  })
  const nextAttemptAt = status === 'retry_scheduled' ? new Date(Date.now() + 60_000) : null
  const processedAt = status === 'retry_scheduled' ? null : new Date()
  const lastError = input.error ?? input.skipReason ?? null

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
      dispatch_mode,
      skip_reason,
      payload_summary,
      consent_basis,
      request_id,
      http_status,
      validation_result,
      response_semantics,
      latency_ms,
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
      ${lastError},
      ${dispatchMode},
      ${input.skipReason ?? null},
      ${sql.json(input.payloadSummary ?? {})},
      ${sql.json(input.consentBasis ?? {})},
      ${input.requestId ?? null},
      ${input.httpStatus ?? null},
      ${sql.json(input.validationResult ?? {})},
      ${input.responseSemantics ?? null},
      ${input.latencyMs ?? null},
      ${processedAt}
    )
    on conflict (provider, idempotency_key) do update
    set
      status = case
        when ops.provider_dispatch_attempts.status in ('succeeded', 'accepted_unverified')
          then ops.provider_dispatch_attempts.status
        when excluded.status = 'succeeded' then 'succeeded'
        when excluded.status = 'accepted_unverified' then 'accepted_unverified'
        when excluded.status = 'skipped_unqualified' then 'skipped_unqualified'
        when excluded.status = 'failed' then 'failed'
        when excluded.dispatch_mode <> 'server_retry' then excluded.status
        when ops.provider_dispatch_attempts.payload = '{}'::jsonb then 'failed'
        else 'retry_scheduled'
      end,
      attempt_count = ops.provider_dispatch_attempts.attempt_count + 1,
      next_attempt_at = case
        when ops.provider_dispatch_attempts.status in ('succeeded', 'accepted_unverified') then null
        when excluded.status = 'succeeded' then null
        when excluded.status = 'accepted_unverified' then null
        when excluded.status = 'skipped_unqualified' then null
        when excluded.status = 'failed' then null
        when excluded.dispatch_mode <> 'server_retry' then null
        when ops.provider_dispatch_attempts.payload = '{}'::jsonb then null
        else excluded.next_attempt_at
      end,
      last_error = excluded.last_error,
      dispatch_mode = excluded.dispatch_mode,
      skip_reason = excluded.skip_reason,
      payload_summary = excluded.payload_summary,
      consent_basis = excluded.consent_basis,
      request_id = excluded.request_id,
      http_status = excluded.http_status,
      validation_result = excluded.validation_result,
      response_semantics = excluded.response_semantics,
      latency_ms = excluded.latency_ms,
      processed_at = excluded.processed_at,
      updated_at = now()
    where ops.provider_dispatch_attempts.status not in ('succeeded', 'accepted_unverified')
  `
}
