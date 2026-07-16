import postgres from 'postgres'
import {
  createMetaViewItemOutboxStore,
  type MetaViewItemOutboxDatabase,
  type RawMetaViewItemAttempt
} from './createMetaViewItemOutboxStore'

type QueryRow = Record<string, unknown>

export type MetaViewItemOutboxQueryExecutor = <
  T extends QueryRow
>(
  query: string,
  parameters: readonly unknown[]
) => Promise<T[]>

let trackingSql: ReturnType<typeof postgres> | undefined

function getTrackingSql() {
  const connectionString =
    process.env.SUPABASE_VERCEL_POSTGRES_URL ??
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    throw new Error(
      'Missing tracking database connection string'
    )
  }

  trackingSql ??= postgres(connectionString, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    max_lifetime: 60 * 30,
    prepare: false
  })

  return trackingSql
}

const executePostgresQuery: MetaViewItemOutboxQueryExecutor =
  async <T extends QueryRow>(
    query: string,
    parameters: readonly unknown[]
  ) => {
    const sql = getTrackingSql()
    const postgresParameters = parameters as Parameters<
      typeof sql.unsafe
    >[1]

    return sql.unsafe<T[]>(query, postgresParameters)
  }

const CLAIM_NEXT_QUERY = `
  with candidate as (
    select id
    from ops.provider_dispatch_attempts
    where provider = $1
      and event_name = $2
      and dispatch_mode = 'server_retry'
      and (
        (
          status in ('pending', 'retry_scheduled')
          and (
            next_attempt_at is null
            or next_attempt_at <= now()
          )
        )
        or (
          status = 'processing'
          and coalesce(last_attempt_started_at, updated_at)
            <= now() - interval '10 minutes'
        )
      )
    order by
      case when status = 'processing' then 0 else 1 end,
      coalesce(next_attempt_at, created_at),
      created_at
    for update skip locked
    limit 1
  )
  update ops.provider_dispatch_attempts as attempt
  set
    status = 'processing',
    attempt_count = attempt.attempt_count + 1,
    next_attempt_at = null,
    last_attempt_started_at = now(),
    updated_at = now()
  from candidate
  where attempt.id = candidate.id
  returning
    attempt.id::text as attempt_id,
    attempt.attempt_count,
    attempt.payload
`

const ACCEPTED_UNVERIFIED_QUERY = `
  update ops.provider_dispatch_attempts
  set
    status = 'accepted_unverified',
    response = $2::jsonb,
    request_id = $3,
    validation_result = $4::jsonb,
    response_semantics = 'provider_accepted_unverified',
    http_status = null,
    last_error = null,
    next_attempt_at = null,
    latency_ms = $5,
    processed_at = now(),
    updated_at = now()
  where id = $1::uuid
    and status = 'processing'
  returning id::text as id
`

const RETRY_SCHEDULED_QUERY = `
  update ops.provider_dispatch_attempts
  set
    status = 'retry_scheduled',
    next_attempt_at = $2::timestamptz,
    last_error = $3,
    latency_ms = $4,
    response_semantics = 'transient_failure_retry_scheduled',
    processed_at = null,
    updated_at = now()
  where id = $1::uuid
    and status = 'processing'
  returning id::text as id
`

const DEAD_LETTER_QUERY = `
  with completed as (
    update ops.provider_dispatch_attempts
    set
      status = 'dead_lettered',
      next_attempt_at = null,
      last_error = $2,
      latency_ms = $3,
      response_semantics = 'terminal_failure',
      processed_at = now(),
      updated_at = now()
    where id = $1::uuid
      and status = 'processing'
    returning id, event_id, event_name
  )
  insert into ops.dead_letter_events (
    source,
    reason,
    payload,
    metadata
  )
  select
    'meta',
    $4,
    jsonb_build_object('provider_dispatch_attempt_id', id),
    jsonb_build_object(
      'event_id', event_id,
      'event_name', event_name,
      'provider', 'meta'
    )
  from completed
  returning id::text as id
`

const INVALID_PAYLOAD_QUERY = `
  with completed as (
    update ops.provider_dispatch_attempts
    set
      status = 'dead_lettered',
      next_attempt_at = null,
      last_error = $2,
      latency_ms = 0,
      response_semantics = 'invalid_payload',
      processed_at = now(),
      updated_at = now()
    where id = $1::uuid
      and status = 'processing'
    returning id, event_id, event_name
  )
  insert into ops.dead_letter_events (
    source,
    reason,
    payload,
    metadata
  )
  select
    'meta',
    'invalid_canonical_payload',
    jsonb_build_object('provider_dispatch_attempt_id', id),
    jsonb_build_object(
      'event_id', event_id,
      'event_name', event_name,
      'provider', 'meta'
    )
  from completed
  returning id::text as id
`

function assertCompleted(rows: QueryRow[], attemptId: string) {
  if (rows.length !== 1) {
    throw new Error(
      `Meta outbox attempt ${attemptId} is no longer processing`
    )
  }
}

function parseClaimedRow(
  row: QueryRow | undefined
): RawMetaViewItemAttempt | null {
  if (!row) return null

  const attemptId = row.attempt_id
  const attemptCount = row.attempt_count

  if (
    typeof attemptId !== 'string' ||
    typeof attemptCount !== 'number'
  ) {
    throw new Error('Invalid Meta outbox claim result')
  }

  return { attemptCount, attemptId, payload: row.payload }
}

export function createPostgresMetaViewItemOutboxDatabase(
  executeQuery: MetaViewItemOutboxQueryExecutor = executePostgresQuery
): MetaViewItemOutboxDatabase {
  return {
    claimNext: async () => {
      const rows = await executeQuery(CLAIM_NEXT_QUERY, [
        'meta',
        'view_item'
      ])

      return parseClaimedRow(rows[0])
    },
    markAcceptedUnverified: async outcome => {
      const result = outcome.receipt.result
      const validationResult = {
        events_received: result.eventsReceived,
        ...(result.processedEntries === undefined ?
          {}
        : { processed_entries: result.processedEntries })
      }
      const rows = await executeQuery(
        ACCEPTED_UNVERIFIED_QUERY,
        [
          outcome.attemptId,
          result,
          result.fbTraceId ?? null,
          validationResult,
          outcome.latencyMs
        ]
      )

      assertCompleted(rows, outcome.attemptId)
    },
    markRetryScheduled: async outcome => {
      const rows = await executeQuery(RETRY_SCHEDULED_QUERY, [
        outcome.attemptId,
        outcome.nextAttemptAt,
        outcome.errorMessage,
        outcome.latencyMs
      ])

      assertCompleted(rows, outcome.attemptId)
    },
    markDeadLettered: async outcome => {
      const reason =
        outcome.reason === 'attempts_exhausted' ?
          'meta_attempts_exhausted'
        : 'meta_permanent_error'
      const rows = await executeQuery(DEAD_LETTER_QUERY, [
        outcome.attemptId,
        outcome.errorMessage,
        outcome.latencyMs,
        reason
      ])

      assertCompleted(rows, outcome.attemptId)
    },
    markInvalidPayload: async failure => {
      const rows = await executeQuery(INVALID_PAYLOAD_QUERY, [
        failure.attemptId,
        failure.errorMessage
      ])

      assertCompleted(rows, failure.attemptId)
    }
  }
}

export const postgresMetaViewItemOutboxStore =
  createMetaViewItemOutboxStore(
    createPostgresMetaViewItemOutboxDatabase()
  )
