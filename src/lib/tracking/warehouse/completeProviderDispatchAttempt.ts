import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'

export async function completeProviderDispatchAttempt(id: string, latencyMs: number): Promise<void> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return
  }

  await sql`
    update ops.provider_dispatch_attempts
    set
      status = 'succeeded',
      attempt_count = attempt_count + 1,
      next_attempt_at = null,
      last_error = null,
      response = jsonb_build_object('success', true, 'completedAt', now()),
      latency_ms = ${Math.max(0, Math.round(latencyMs))},
      processed_at = now(),
      updated_at = now()
    where id = ${id}
      and status = 'processing'
  `
}
