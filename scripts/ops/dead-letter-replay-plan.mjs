#!/usr/bin/env node

import { pathToFileURL } from 'node:url'
import dotenv from 'dotenv'
import postgres from 'postgres'
import { z } from 'zod'

import { redactOperationalText } from './provider-dispatch-feedback-report.mjs'

dotenv.config({ path: '.env.local', quiet: true })
dotenv.config({ path: '.env.mcp.local', override: false, quiet: true })

const DEFAULT_LIMIT = 100
const SUPPORTED_REPLAY_PROVIDERS = new Set(['meta', 'google', 'microsoft_uet'])
const TRACKING_SOURCE_PREFIX = 'tracking:'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const deadLetterReplayRowSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  reason: z.string().min(1),
  metadata: z.unknown(),
  created_at: z.unknown(),
  attempt_id: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  dispatch_mode: z.string().nullable().optional(),
  event_id: z.string().nullable().optional(),
  event_name: z.string().nullable().optional(),
  skip_reason: z.string().nullable().optional(),
  attempt_updated_at: z.unknown().optional()
})

function getCliValue(name, argv = process.argv.slice(2)) {
  const prefix = `${name}=`
  const inline = argv.find(argument => argument.startsWith(prefix))

  if (inline) {
    return inline.slice(prefix.length)
  }

  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : undefined
}

function getCliFlag(name, argv = process.argv.slice(2)) {
  return argv.includes(name)
}

function toIsoString(value) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function normalizeText(value, fallback = null) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback
}

function getReplayProvider(source) {
  if (!source.startsWith(TRACKING_SOURCE_PREFIX)) {
    return null
  }

  const provider = source.slice(TRACKING_SOURCE_PREFIX.length)
  return SUPPORTED_REPLAY_PROVIDERS.has(provider) ? provider : null
}

function getProviderDispatchAttemptId(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }

  const value = metadata.providerDispatchAttemptId
  return typeof value === 'string' && UUID_PATTERN.test(value) ? value : null
}

function hasMissingClientIdReason(reason, skipReason) {
  const normalized = `${reason} ${skipReason ?? ''}`.toLowerCase()
  return normalized.includes('missing_client_id') || normalized.includes('missing client_id')
}

function classifyReplayRow(row) {
  const parsed = deadLetterReplayRowSchema.parse(row)
  const source = parsed.source
  const provider = getReplayProvider(source)
  const reason = redactOperationalText(parsed.reason)
  const metadataAttemptId = getProviderDispatchAttemptId(parsed.metadata)
  const attemptId = normalizeText(parsed.attempt_id) ?? metadataAttemptId
  const attemptProvider = normalizeText(parsed.provider)
  const attemptStatus = normalizeText(parsed.status)
  const dispatchMode = normalizeText(parsed.dispatch_mode)
  const skipReason = normalizeText(parsed.skip_reason)

  const base = {
    deadLetterId: parsed.id,
    source,
    provider,
    reason,
    createdAt: toIsoString(parsed.created_at),
    attemptId,
    eventId: normalizeText(parsed.event_id),
    eventName: normalizeText(parsed.event_name),
    attemptProvider,
    attemptStatus,
    dispatchMode,
    skipReason: skipReason ? redactOperationalText(skipReason) : null,
    attemptUpdatedAt: toIsoString(parsed.attempt_updated_at)
  }

  if (!provider) {
    return {
      ...base,
      eligible: false,
      classification: 'unsupported_source',
      requiredAction: 'Resolve manually; only tracking:meta, tracking:google, and tracking:microsoft_uet are replay-supported.'
    }
  }

  if (!metadataAttemptId) {
    return {
      ...base,
      eligible: false,
      classification: 'invalid_metadata',
      requiredAction: 'Inspect the dead-letter metadata and repair or resolve manually before replay.'
    }
  }

  if (!attemptProvider || !attemptStatus || !dispatchMode) {
    return {
      ...base,
      eligible: false,
      classification: 'attempt_not_found',
      requiredAction: 'Find or restore the referenced provider dispatch attempt before replay.'
    }
  }

  if (attemptProvider !== provider) {
    return {
      ...base,
      eligible: false,
      classification: 'provider_mismatch',
      requiredAction: 'Do not replay until dead-letter source and provider dispatch attempt provider match.'
    }
  }

  if (attemptStatus === 'succeeded') {
    return {
      ...base,
      eligible: false,
      classification: 'already_succeeded',
      requiredAction: 'Resolve the dead letter as already succeeded; no provider replay needed.'
    }
  }

  if (provider === 'google' && hasMissingClientIdReason(parsed.reason, skipReason)) {
    return {
      ...base,
      eligible: false,
      classification: 'requires_attribution_repair',
      requiredAction: 'Do not replay missing client_id rows; repair attribution or resolve as unqualified.'
    }
  }

  if (dispatchMode !== 'server_retry') {
    return {
      ...base,
      eligible: false,
      classification: 'non_retry_dispatch_mode',
      requiredAction: 'Do not replay server_direct/client_observed audit rows through the retry queue.'
    }
  }

  if (attemptStatus !== 'dead_lettered') {
    return {
      ...base,
      eligible: false,
      classification: 'non_dead_letter_attempt_status',
      requiredAction: `Attempt is ${attemptStatus}; only dead_lettered attempts are eligible for replay.`
    }
  }

  return {
    ...base,
    eligible: true,
    classification: 'eligible_requeue',
    requiredAction: 'Approval required before production replay; requeue with original event_id and provider idempotency key.'
  }
}

function summarizeClassifications(items) {
  return items.reduce((summary, item) => {
    summary[item.classification] = (summary[item.classification] ?? 0) + 1
    return summary
  }, {})
}

function normalizeSummaryRows(summaryRows) {
  return summaryRows.map(row => ({
    source: normalizeText(row.source, 'unknown'),
    reason: redactOperationalText(normalizeText(row.reason, 'unknown')),
    unresolvedCount: Number(row.unresolved_count ?? 0),
    totalCount: Number(row.total_count ?? 0),
    latestCreatedAt: toIsoString(row.latest_created_at),
    latestResolvedAt: toIsoString(row.latest_resolved_at)
  }))
}

export function buildReplayPlan(deadLetterRows, summaryRows = [], options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const items = deadLetterRows.map(classifyReplayRow)
  const eligibleCount = items.filter(item => item.eligible).length

  return {
    generatedAt,
    dryRun: true,
    mutationPerformed: false,
    approvalRequiredForReplay: eligibleCount > 0,
    approvalQuestion:
      eligibleCount > 0
        ? `Approve one production dead-letter replay run for ${eligibleCount} eligible row(s) by enabling DEAD_LETTER_REPLAY_ENABLED=1 and invoking /api/cron/replay-dead-letter with CRON_SECRET? This will requeue and dispatch provider attempts with original event_id/idempotency.`
        : null,
    totals: {
      unresolvedRowsInspected: items.length,
      eligibleRequeue: eligibleCount,
      ineligible: items.length - eligibleCount
    },
    classifications: summarizeClassifications(items),
    deadLetterSummary: normalizeSummaryRows(summaryRows),
    items
  }
}

export function formatReplayPlan(plan) {
  const lines = [
    'Utekos dead-letter replay plan',
    `Generated at: ${plan.generatedAt}`,
    'Mode: dry-run read-only',
    'Mutation performed: no',
    '',
    'Totals',
    `- unresolved rows inspected: ${plan.totals.unresolvedRowsInspected}`,
    `- eligible requeue rows: ${plan.totals.eligibleRequeue}`,
    `- ineligible rows: ${plan.totals.ineligible}`,
    '',
    'Classifications'
  ]

  const classificationEntries = Object.entries(plan.classifications).sort(([left], [right]) =>
    left.localeCompare(right)
  )

  if (classificationEntries.length === 0) {
    lines.push('- none')
  } else {
    for (const [classification, count] of classificationEntries) {
      lines.push(`- ${classification}: ${count}`)
    }
  }

  lines.push('', 'Replay candidates')

  if (plan.items.length === 0) {
    lines.push('- none')
  } else {
    for (const item of plan.items) {
      lines.push(
        `- ${item.classification} | ${item.source} | attempt=${item.attemptId ?? 'n/a'} | event=${item.eventName ?? 'n/a'} | eligible=${item.eligible ? 'yes' : 'no'} | action=${item.requiredAction}`
      )
    }
  }

  if (plan.approvalQuestion) {
    lines.push('', 'Approval gate', `- ${plan.approvalQuestion}`)
  }

  return `${lines.join('\n')}\n`
}

export function getWarehouseUrl(env = process.env) {
  return (
    env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING
    || env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING_MAYBE
    || env.SUPABASE_VERCEL_POSTGRES_URL
    || null
  )
}

function getLimit(argv = process.argv.slice(2)) {
  const rawLimit = getCliValue('--limit', argv)
  const parsed = Number(rawLimit)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 500) : DEFAULT_LIMIT
}

async function queryReplayPlanRows(warehouseUrl, limit) {
  const sql = postgres(warehouseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false
  })

  try {
    const deadLetterRows = await sql`
      select
        dead_letters.id::text,
        dead_letters.source,
        dead_letters.reason,
        dead_letters.metadata,
        dead_letters.created_at,
        attempts.id::text as attempt_id,
        attempts.provider,
        attempts.status,
        attempts.dispatch_mode,
        attempts.event_id,
        attempts.event_name,
        attempts.skip_reason,
        attempts.updated_at as attempt_updated_at
      from ops.dead_letter_events as dead_letters
      left join ops.provider_dispatch_attempts as attempts
        on attempts.id::text = dead_letters.metadata ->> 'providerDispatchAttemptId'
      where dead_letters.resolved_at is null
      order by dead_letters.created_at, dead_letters.id
      limit ${limit}
    `

    const summaryRows = await sql`
      select
        source,
        reason,
        unresolved_count,
        total_count,
        latest_created_at,
        latest_resolved_at
      from ops.dead_letter_summary
      order by unresolved_count desc, total_count desc, source, reason
    `

    return { deadLetterRows, summaryRows }
  } finally {
    await sql.end({ timeout: 5 })
  }
}

async function main() {
  const warehouseUrl = getWarehouseUrl()
  const outputJson = getCliFlag('--json')
  const limit = getLimit()

  if (!warehouseUrl) {
    console.error(
      'No Supabase tracking warehouse URL configured. Set SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING or SUPABASE_VERCEL_POSTGRES_URL.'
    )
    process.exitCode = 1
    return
  }

  const { deadLetterRows, summaryRows } = await queryReplayPlanRows(warehouseUrl, limit)
  const plan = buildReplayPlan(deadLetterRows, summaryRows)

  if (outputJson) {
    console.log(JSON.stringify(plan, null, 2))
  } else {
    process.stdout.write(formatReplayPlan(plan))
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
