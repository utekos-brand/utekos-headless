import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import { providerDispatchQueueItemSchema } from '@/lib/tracking/warehouse/providerDispatchQueueItemSchema'
import type { ProviderDispatchQueueItem } from 'types/tracking/warehouse/ProviderDispatchQueueItem'

export async function claimProviderDispatchAttempts(
  limit: number
): Promise<ProviderDispatchQueueItem[]> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return []
  }

  const rows = await sql`
    with candidates as (
      select id
      from ops.provider_dispatch_attempts
      where (
        provider in ('meta', 'google')
        and dispatch_mode = 'server_retry'
        and status in ('pending', 'retry_scheduled')
        and coalesce(next_attempt_at, created_at) <= now()
      ) or (
        provider in ('meta', 'google')
        and dispatch_mode = 'server_retry'
        and status = 'processing'
        and updated_at <= now() - interval '10 minutes'
      )
      order by coalesce(next_attempt_at, created_at), created_at
      for update skip locked
      limit ${limit}
    )
    update ops.provider_dispatch_attempts as attempts
    set
      status = 'processing',
      last_attempt_started_at = now(),
      updated_at = now()
    from candidates
    where attempts.id = candidates.id
    returning
      attempts.id,
      attempts.provider,
      attempts.event_id as "eventId",
      attempts.event_name as "eventName",
      attempts.payload,
      attempts.attempt_count as "attemptCount"
  `

  return providerDispatchQueueItemSchema.array().parse(rows)
}
