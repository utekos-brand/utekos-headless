import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { UsercentricsConsentState } from '@/components/cookie-consent/usercentricsConsentSchema'
import type postgres from 'postgres'

export async function persistConsentSnapshot(
  consent: UsercentricsConsentState,
  identifiers: {
    anonymousId?: string | null
    externalId?: string | null
  } = {}
): Promise<void> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return
  }

  await sql`
    insert into marketing.consent_snapshots (
      anonymous_id,
      external_id,
      categories,
      source,
      occurred_at
    )
    values (
      ${identifiers.anonymousId ?? null},
      ${identifiers.externalId ?? null},
      ${sql.json(consent as postgres.JSONValue)},
      'usercentrics',
      now()
    )
  `
}
