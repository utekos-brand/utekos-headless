import 'server-only'

import postgres from 'postgres'
import type { LeadSource } from './leadFormIds'

let trackingSql: ReturnType<typeof postgres> | undefined

function getTrackingSql() {
  const connectionString =
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    throw new Error('Missing tracking database connection string')
  }

  trackingSql ??= postgres(connectionString, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    max_lifetime: 60 * 30
  })

  return trackingSql
}

export type InsertMarketingLeadInput = {
  id: string
  email: string
  phone?: string
  firstName?: string
  source: LeadSource
  campaign?: string
  medium?: string
  content?: string
  term?: string
  consentMarketing: boolean
  consentSource?: string
  consentedAt?: string
  metadata: Record<string, unknown>
}

export async function insertMarketingLead(
  input: InsertMarketingLeadInput
): Promise<{ id: string }> {
  const sql = getTrackingSql()
  const consentedAt =
    input.consentedAt ? new Date(input.consentedAt) : null

  const inserted = await sql`
    insert into marketing.leads (
      id,
      email,
      phone,
      first_name,
      source,
      campaign,
      medium,
      content,
      term,
      consent_marketing,
      consent_source,
      consented_at,
      metadata
    ) values (
      ${input.id},
      ${input.email},
      ${input.phone ?? null},
      ${input.firstName ?? null},
      ${input.source},
      ${input.campaign ?? null},
      ${input.medium ?? null},
      ${input.content ?? null},
      ${input.term ?? null},
      ${input.consentMarketing},
      ${input.consentSource ?? null},
      ${consentedAt},
      ${sql.json(input.metadata as postgres.JSONValue)}
    )
    on conflict (id) do nothing
    returning id
  `

  if (inserted.length === 1) {
    const row = inserted[0]
    if (!row) {
      return { id: input.id }
    }
    return { id: row.id as string }
  }

  return { id: input.id }
}
