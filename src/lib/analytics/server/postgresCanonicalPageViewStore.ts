import 'server-only'
import postgres from 'postgres'
import {
  createCanonicalEventStore,
  type CanonicalEventTransactionRunner
} from './createCanonicalEventStore'

let trackingSql: ReturnType<typeof postgres> | undefined

function getTrackingSql() {
  const connectionString =
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
    max_lifetime: 60 * 30
  })

  return trackingSql
}

const runPostgresTransaction: CanonicalEventTransactionRunner =
  work =>
    getTrackingSql().begin(async sql =>
      work({
        insertLedger: async row => {
          const inserted = await sql`
            insert into marketing.event_ledger (
              event_id,
              event_name,
              idempotency_key,
              external_id,
              source_url,
              consent,
              user_data_quality,
              payload,
              occurred_at
            ) values (
              ${row.event_id},
              ${row.event_name},
              ${row.idempotency_key},
              ${row.external_id ?? null},
              ${row.source_url ?? null},
              ${sql.json(row.consent)},
              ${sql.json(row.user_data_quality)},
              ${sql.json(row.payload as postgres.JSONValue)},
              ${row.occurred_at}
            )
            on conflict (idempotency_key) do nothing
            returning id
          `

          return inserted.length === 1
        },
        insertDispatch: async row => {
          await sql`
            insert into ops.provider_dispatch_attempts (
              idempotency_key,
              provider,
              event_id,
              event_name,
              status,
              next_attempt_at,
              payload,
              consent_basis,
              data_quality,
              dispatch_mode
            ) values (
              ${row.idempotency_key},
              ${row.provider},
              ${row.event_id},
              ${row.event_name},
              ${row.status},
              now(),
              ${sql.json(row.payload as postgres.JSONValue)},
              ${sql.json(row.consent_basis)},
              ${sql.json(row.data_quality)},
              ${row.dispatch_mode}
            )
            on conflict (provider, idempotency_key) do nothing
          `
        }
      })
    )

export const postgresCanonicalEventStore =
  createCanonicalEventStore(runPostgresTransaction)

export const postgresCanonicalPageViewStore =
  postgresCanonicalEventStore
