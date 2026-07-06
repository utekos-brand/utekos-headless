import 'server-only'

import { getTrackingWarehouse } from '@/lib/tracking/warehouse/getTrackingWarehouse'

export type LandingAttributionInput = {
  anonymousId?: string | null
  source?: string | null
  medium?: string | null
  campaign?: string | null
  content?: string | null
  term?: string | null
  landingPath?: string | null
  referrer?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Persisterer attribusjon for et landingsside-besøk til
 * `marketing.attribution_events`. Skrives via service-role warehouse-klienten
 * fordi `marketing`-schemaet bevisst ikke er eksponert via Data API.
 *
 * Designet som best-effort: feil kastes til kalleren slik at den kan logge,
 * men skal aldri blokkere brukerresponsen (kalles i bakgrunnen).
 */
export async function persistLandingAttribution(input: LandingAttributionInput): Promise<void> {
  const sql = getTrackingWarehouse()

  if (!sql) {
    return
  }

  await sql`
    insert into marketing.attribution_events (
      anonymous_id,
      source,
      medium,
      campaign,
      content,
      term,
      landing_path,
      referrer,
      user_agent,
      metadata
    )
    values (
      ${input.anonymousId ?? null},
      ${input.source ?? null},
      ${input.medium ?? null},
      ${input.campaign ?? null},
      ${input.content ?? null},
      ${input.term ?? null},
      ${input.landingPath ?? null},
      ${input.referrer ?? null},
      ${input.userAgent ?? null},
      ${sql.json((input.metadata ?? {}) as Record<string, never>)}
    )
  `
}
