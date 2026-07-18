import type {
  GoogleDataManagerStatusClaim,
  GoogleDataManagerStatusOutcome
} from './googleDataManagerStatusTypes'
import { retrieveGoogleDataManagerRequestStatus } from './retrieveGoogleDataManagerRequestStatus'

type Dependencies = {
  now: () => number
  retrieveStatus: typeof retrieveGoogleDataManagerRequestStatus
}

const defaultDependencies: Dependencies = {
  now: Date.now,
  retrieveStatus: retrieveGoogleDataManagerRequestStatus
}

function summarizeError(error: unknown) {
  const message =
    error instanceof Error ? error.message : String(error)

  return message.slice(0, 1_000)
}

export async function reconcileGoogleDataManagerStatusAttempt(
  claim: GoogleDataManagerStatusClaim,
  dependencies: Dependencies = defaultDependencies
): Promise<GoogleDataManagerStatusOutcome> {
  const startedAt = dependencies.now()

  try {
    const result = await dependencies.retrieveStatus(
      claim.requestId
    )
    const latencyMs = Math.max(0, dependencies.now() - startedAt)

    switch (result.overallStatus) {
      case 'SUCCESS':
        return { claim, latencyMs, result, status: 'succeeded' }
      case 'FAILED':
        return { claim, latencyMs, result, status: 'failed' }
      case 'PARTIAL_SUCCESS':
        return {
          claim,
          latencyMs,
          result,
          status: 'partial_success'
        }
      case 'PROCESSING':
        return { claim, latencyMs, result, status: 'processing' }
      default:
        return { claim, latencyMs, result, status: 'unknown' }
    }
  } catch (error) {
    return {
      claim,
      errorMessage: summarizeError(error),
      latencyMs: Math.max(0, dependencies.now() - startedAt),
      status: 'retry'
    }
  }
}
