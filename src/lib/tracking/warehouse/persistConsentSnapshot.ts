import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { CookiebotConsentState } from '@/components/cookie-consent/cookiebotConsentSchema'
import type postgres from 'postgres'

export async function persistConsentSnapshot(
  consent: CookiebotConsentState,
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
      'cookiebot',
      now()
    )
  `
}
