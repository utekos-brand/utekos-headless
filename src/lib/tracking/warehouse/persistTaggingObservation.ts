import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { InternalTaggingObservation } from '@/lib/tracking/receipts/trackingReceiptSchema'

export async function persistTaggingObservation(
  receipt: InternalTaggingObservation
): Promise<boolean> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    throw new Error('Tracking warehouse is not configured')
  }

  const rows = await sql<{ id: string }[]>`
    insert into ops.tagging_observations (
      idempotency_key,
      event_id,
      event_name,
      observation_type,
      container_id,
      container_version,
      client_name,
      tag_id,
      tag_status,
      tag_execution_time_ms,
      observed_at
    ) values (
      ${receipt.idempotencyKey},
      ${receipt.eventId},
      ${receipt.eventName},
      ${receipt.observationType},
      ${'containerId' in receipt ? receipt.containerId : null},
      ${'containerVersion' in receipt ? receipt.containerVersion : null},
      ${'clientName' in receipt ? receipt.clientName : null},
      ${'tagId' in receipt ? receipt.tagId : null},
      ${'tagStatus' in receipt ? receipt.tagStatus : null},
      ${'tagExecutionTimeMs' in receipt ? receipt.tagExecutionTimeMs ?? null : null},
      ${new Date(receipt.observedAt)}
    )
    on conflict (idempotency_key) do nothing
    returning id
  `

  return rows.length === 1
}
