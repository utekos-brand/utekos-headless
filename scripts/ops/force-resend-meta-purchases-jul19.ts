import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import postgres from 'postgres'
import {
  canonicalPurchaseSchema,
  type CanonicalPurchase
} from '@/lib/analytics/purchaseEvent'
import { dispatchCanonicalPurchaseToMeta } from '@/lib/analytics/server/dispatchCanonicalPurchaseToMeta'

const DRY_RUN = process.argv.includes('--dry-run')
const ORDER_NAMES = ['1869', '1870', '1871']

function loadEnv(path: string) {
  const text = readFileSync(path, 'utf8')

  for (const raw of text.split(/\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq <= 0) continue

    const key = line.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue

    let val = line.slice(eq + 1)
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }

    if (!(key in process.env)) process.env[key] = val
  }
}

async function main() {
  loadEnv('.env.local')

  const databaseUrl =
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING
  if (!databaseUrl) {
    throw new Error('Missing SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING')
  }

  const sql = postgres(databaseUrl, {
    ssl: 'require',
    max: 1
  })

  const rows = await sql<
    Array<{
      idempotency_key: string
      event_id: string
      payload: CanonicalPurchase
    }>
  >`
    select idempotency_key, event_id, payload
    from marketing.event_ledger
    where event_name = 'purchase'
      and payload->'custom_data'->>'order_name' in ${sql(ORDER_NAMES)}
    order by created_at
  `

  const results: Array<Record<string, unknown>> = []

  for (const row of rows) {
    const original = canonicalPurchaseSchema.parse(row.payload)

    if (original.consent.marketing !== 'granted') {
      results.push({
        order: original.custom_data.order_name,
        skipped: 'marketing_consent_denied'
      })
      continue
    }

    const replayEventId = randomUUID()
    const replay = canonicalPurchaseSchema.parse({
      ...original,
      event_id: replayEventId,
      source: 'server'
    })

    if (DRY_RUN) {
      results.push({
        order: original.custom_data.order_name,
        originalEventId: original.event_id,
        replayEventId: replay.event_id,
        value: original.custom_data.value,
        hasFbc: Boolean(original.browser_id?.fbc),
        hasFbclid: Boolean(original.click_id?.fbclid),
        dryRun: true
      })
      continue
    }

    const startedAt = Date.now()
    const receipt = await dispatchCanonicalPurchaseToMeta(replay)
    const latencyMs = Date.now() - startedAt
    const replayIdempotencyKey = `backfill:meta-purchase-replay:${original.custom_data.transaction_id}:${replayEventId}`
    const dataQuality = {
      has_external_id: Boolean(original.external_id),
      email_sha256_count:
        original.user_data?.email_sha256?.length ?? 0,
      phone_sha256_count:
        original.user_data?.phone_sha256?.length ?? 0,
      replay_of_event_id: original.event_id
    }

    await sql`
      insert into marketing.event_ledger (
        event_id,
        event_name,
        idempotency_key,
        anonymous_id,
        external_id,
        source_url,
        consent,
        user_data_quality,
        payload,
        occurred_at
      ) values (
        ${replay.event_id},
        'purchase',
        ${replayIdempotencyKey},
        ${original.external_id ?? null},
        ${original.external_id ?? null},
        ${original.page_url ?? null},
        ${sql.json(original.consent)},
        ${sql.json(dataQuality)},
        ${sql.json({
          ...replay,
          delivery: {
            meta: receipt,
            meta_force_replay: {
              original_event_id: original.event_id,
              reason: 'ads_attribution_gap_2026-07-19'
            }
          }
        })},
        ${original.event_time}
      )
      on conflict (idempotency_key) do nothing
    `

    await sql`
      insert into ops.provider_dispatch_attempts (
        idempotency_key,
        provider,
        event_id,
        event_name,
        status,
        attempt_count,
        response,
        payload,
        consent_basis,
        data_quality,
        latency_ms,
        dispatch_mode,
        payload_summary,
        request_id,
        validation_result,
        response_semantics,
        processed_at,
        last_attempt_started_at,
        created_at,
        updated_at
      ) values (
        ${replayIdempotencyKey},
        'meta',
        ${replay.event_id},
        'purchase',
        'accepted_unverified',
        1,
        ${sql.json(receipt.result)},
        ${sql.json(replay)},
        ${sql.json(original.consent)},
        ${sql.json(dataQuality)},
        ${latencyMs},
        'server_direct',
        ${sql.json({})},
        ${receipt.result.fbTraceId ?? null},
        ${sql.json({ events_received: receipt.result.eventsReceived })},
        'provider_accepted_unverified',
        now(),
        now(),
        now(),
        now()
      )
      on conflict (provider, idempotency_key) do nothing
    `

    results.push({
      order: original.custom_data.order_name,
      originalEventId: original.event_id,
      replayEventId: replay.event_id,
      value: original.custom_data.value,
      hasFbc: Boolean(original.browser_id?.fbc),
      hasFbclid: Boolean(original.click_id?.fbclid),
      receipt
    })
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        count: results.length,
        results
      },
      null,
      2
    )
  )

  await sql.end({ timeout: 5 })
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
