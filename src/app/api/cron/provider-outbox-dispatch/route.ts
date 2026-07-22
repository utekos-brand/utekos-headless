import {
  runRegisteredProviderOutboxBatch,
  type RegisteredProviderOutboxBatchSummary
} from '../../../../lib/analytics/server/runRegisteredProviderOutboxBatch'
import { hasValidCronAuthorization } from '../../../../lib/security/hasValidCronAuthorization'

const CRON_BATCH_SIZE = 10

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

export async function handleProviderOutboxCron(
  request: Request,
  dependencies: ProviderOutboxCronDependencies = defaultDependencies
) {
  const authorized = hasValidCronAuthorization(
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
