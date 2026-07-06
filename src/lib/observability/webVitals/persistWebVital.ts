import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { WebVitalPayload } from '@/lib/observability/webVitals/webVitalPayloadSchema'
import type postgres from 'postgres'

export async function persistWebVital(metric: WebVitalPayload): Promise<void> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return
  }

  await sql`
    insert into ops.web_vitals (
      metric_id,
      name,
      value,
      delta,
      rating,
      pathname,
      href,
      referrer,
      navigation_type,
      attribution,
      entries,
      reported_at
    )
    values (
      ${metric.id},
      ${metric.name},
      ${metric.value},
      ${metric.delta ?? null},
      ${metric.rating ?? null},
      ${metric.pathname ?? null},
      ${metric.href ?? null},
      ${metric.referrer ?? null},
      ${metric.navigationType ?? null},
      ${metric.attribution === undefined ? null : sql.json(metric.attribution as postgres.JSONValue)},
      ${sql.json(metric.entries as postgres.JSONValue)},
      ${new Date(metric.timestamp)}
    )
  `
}
