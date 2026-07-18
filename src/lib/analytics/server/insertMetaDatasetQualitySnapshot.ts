import postgres from 'postgres'
import type { MetaDatasetQualityEvent } from './metaDatasetQualitySchema'

let trackingSql: ReturnType<typeof postgres> | undefined

function getTrackingSql() {
  const connectionString =
    process.env.SUPABASE_VERCEL_POSTGRES_URL ??
    process.env.SUPABASE_VERCEL_POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    throw new Error('Missing tracking database connection string')
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

export type MetaDatasetQualitySnapshotInput = {
  datasetId: string
  events: MetaDatasetQualityEvent[]
  measuredAt: Date
}

export async function insertMetaDatasetQualitySnapshot(
  input: MetaDatasetQualitySnapshotInput
) {
  const client = getTrackingSql()

  return client.begin(async sql => {
    let insertedCount = 0

    for (const event of input.events) {
      const inserted = await sql`
        insert into marketing.meta_quality_snapshots (
          dataset_id,
          event_name,
          event_match_quality,
          event_coverage,
          dedup_key_feedback,
          data_freshness,
          raw_payload,
          measured_at
        )
        select
          ${input.datasetId},
          ${event.event_name},
          ${event.event_match_quality?.composite_score ?? null},
          ${event.event_coverage?.percentage ?? null},
          ${sql.json(
            (event.dedupe_key_feedback ?? []) as postgres.JSONValue
          )},
          ${sql.json(
            (event.data_freshness ?? {}) as postgres.JSONValue
          )},
          ${sql.json(event as postgres.JSONValue)},
          ${input.measuredAt}
        where not exists (
          select 1
          from marketing.meta_quality_snapshots existing
          where existing.dataset_id = ${input.datasetId}
            and existing.event_name = ${event.event_name}
            and existing.measured_at >= date_trunc(
              'day',
              ${input.measuredAt}::timestamptz
            )
            and existing.measured_at < date_trunc(
              'day',
              ${input.measuredAt}::timestamptz
            ) + interval '1 day'
        )
        returning id
      `

      insertedCount += inserted.length
    }

    return insertedCount
  })
}
