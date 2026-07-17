import type { CanonicalEvent } from '../canonicalEvent'
import type { ProviderAdapter } from './providerAdapter'
import type {
  ProviderOutboxDatabase,
  ProviderOutboxStore
} from './providerOutboxTypes'

const MAX_INVALID_ROWS_PER_CLAIM = 10

function parseStoredPayload(payload: unknown): unknown {
  if (typeof payload !== 'string') return payload

  try {
    return JSON.parse(payload)
  } catch {
    return payload
  }
}

function summarizeInvalidPayload(
  eventName: string,
  error: {
    issues: ReadonlyArray<{
      message: string
      path: ReadonlyArray<PropertyKey>
    }>
  }
) {
  const details = error.issues
    .slice(0, 10)
    .map(issue => {
      const path =
        issue.path.length > 0 ? issue.path.join('.') : 'event'
      return `${path}: ${issue.message}`
    })
    .join('; ')

  return `Invalid canonical ${eventName} payload: ${details}`.slice(
    0,
    1000
  )
}

export function createProviderOutboxStore<
  E extends CanonicalEvent,
  R
>(
  adapter: ProviderAdapter<E, R>,
  database: ProviderOutboxDatabase<R>
): ProviderOutboxStore<E, R> {
  return {
    claimNext: async () => {
      for (
        let invalidRows = 0;
        invalidRows < MAX_INVALID_ROWS_PER_CLAIM;
        invalidRows += 1
      ) {
        const claimed = await database.claimNext()
        if (!claimed) return null

        const parsed = adapter.schema.safeParse(
          parseStoredPayload(claimed.payload)
        )

        if (parsed.success) {
          return {
            attemptCount: claimed.attemptCount,
            attemptId: claimed.attemptId,
            event: parsed.data
          }
        }

        await database.markInvalidPayload({
          attemptCount: claimed.attemptCount,
          attemptId: claimed.attemptId,
          errorMessage: summarizeInvalidPayload(
            adapter.eventName,
            parsed.error
          )
        })
      }

      return null
    },
    complete: async outcome => {
      switch (outcome.status) {
        case 'succeeded':
          await database.markAcceptedUnverified(outcome)
          break
        case 'retry_scheduled':
          await database.markRetryScheduled(outcome)
          break
        case 'dead_lettered':
          await database.markDeadLettered(outcome)
          break
      }
    }
  }
}
