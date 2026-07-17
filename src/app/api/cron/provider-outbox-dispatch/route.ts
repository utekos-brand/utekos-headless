import { timingSafeEqual } from 'node:crypto'
import {
  runRegisteredProviderOutboxBatch,
  type RegisteredProviderOutboxBatchSummary
} from '../../../../lib/analytics/server/runRegisteredProviderOutboxBatch'

const CRON_BATCH_SIZE = 1

export const maxDuration = 60

type RunBatch = (input: {
  maxItems: number
}) => Promise<RegisteredProviderOutboxBatchSummary>

export type ProviderOutboxCronDependencies = {
  getCronSecret: () => string | undefined
  runBatch: RunBatch
}

const defaultDependencies: ProviderOutboxCronDependencies = {
  getCronSecret: () => process.env.CRON_SECRET,
  runBatch: runRegisteredProviderOutboxBatch
}

function hasValidAuthorization(
  authorization: string | null,
  cronSecret: string | undefined
) {
  if (!authorization || !cronSecret) return false

  const provided = Buffer.from(authorization)
  const expected = Buffer.from(`Bearer ${cronSecret}`)

  return (
    provided.length === expected.length &&
    timingSafeEqual(provided, expected)
  )
}

export async function handleProviderOutboxCron(
  request: Request,
  dependencies: ProviderOutboxCronDependencies = defaultDependencies
) {
  const authorized = hasValidAuthorization(
    request.headers.get('authorization'),
    dependencies.getCronSecret()
  )

  if (!authorized) {
    return Response.json(
      { ok: false },
      { headers: { 'Cache-Control': 'no-store' }, status: 401 }
    )
  }

  const summary = await dependencies.runBatch({
    maxItems: CRON_BATCH_SIZE
  })

  return Response.json(
    { ...summary, ok: true },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export function GET(request: Request) {
  return handleProviderOutboxCron(request)
}
