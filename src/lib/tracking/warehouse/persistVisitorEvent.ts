import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'

export type VisitorEventInput = {
  sourceProject: string
  visitorId: string
  sessionId?: string | null
  pathname?: string | null
  referrer?: string | null
  userAgent?: string | null
  occurredAt: Date
}

export async function persistVisitorEvent(input: VisitorEventInput): Promise<void> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return
  }

  await sql`
    insert into marketing.website_visitor_events (
      source_project,
      visitor_id,
      session_id,
      pathname,
      referrer,
      user_agent,
      occurred_at
    )
    values (
      ${input.sourceProject},
      ${input.visitorId},
      ${input.sessionId ?? null},
      ${input.pathname ?? null},
      ${input.referrer ?? null},
      ${input.userAgent ?? null},
      ${input.occurredAt}
    )
  `
}
