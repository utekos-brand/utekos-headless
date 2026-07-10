import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'

type CheckoutAttributionSnapshotRow = {
  raw_payload: CheckoutAttribution
}

function normalizeLookupTokens(tokens: string[]): string[] {
  return [...new Set(tokens.map(token => token.trim()).filter(Boolean))]
}

export async function getCheckoutAttributionSnapshotByTokens(
  tokens: string[]
): Promise<CheckoutAttribution | null> {
  const sql = getTrackingWarehouse()
  const normalizedTokens = normalizeLookupTokens(tokens)

  if (!sql || normalizedTokens.length === 0) {
    return null
  }

  const rows = await sql<CheckoutAttributionSnapshotRow[]>`
    select s.raw_payload
    from marketing.checkout_attribution_lookup_tokens t
    join marketing.checkout_attribution_snapshots s
      on s.id = t.snapshot_id
    where t.token = any(${normalizedTokens})
    order by s.updated_at desc
    limit 1
  `

  return rows[0]?.raw_payload ?? null
}
