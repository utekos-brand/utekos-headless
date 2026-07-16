import { canonicalViewItemSchema } from '../viewItemEvent'
import type { GoogleDataManagerViewItemAttemptOutcome } from './processGoogleDataManagerViewItemAttempt'

const MAX_INVALID_ROWS_PER_CLAIM = 10

export type RawGoogleDataManagerViewItemAttempt = {
  attemptCount: number
  attemptId: string
  payload: unknown
}

export type ClaimedGoogleDataManagerViewItemAttempt = {
  attemptCount: number
  attemptId: string
  event: ReturnType<typeof canonicalViewItemSchema.parse>
}

type AcceptedOutcome = Extract<
  GoogleDataManagerViewItemAttemptOutcome,
  { status: 'succeeded' }
>
type RetryOutcome = Extract<
  GoogleDataManagerViewItemAttemptOutcome,
  { status: 'retry_scheduled' }
>
type DeadLetterOutcome = Extract<
  GoogleDataManagerViewItemAttemptOutcome,
  { status: 'dead_lettered' }
>

export type GoogleDataManagerViewItemOutboxDatabase = {
  claimNext: () => Promise<RawGoogleDataManagerViewItemAttempt | null>
  markAcceptedUnverified: (outcome: AcceptedOutcome) => Promise<void>
  markDeadLettered: (outcome: DeadLetterOutcome) => Promise<void>
  markInvalidPayload: (failure: {
    attemptId: string
    errorMessage: string
  }) => Promise<void>
  markRetryScheduled: (outcome: RetryOutcome) => Promise<void>
}

export type GoogleDataManagerViewItemOutboxStore = {
  claimNext: () => Promise<ClaimedGoogleDataManagerViewItemAttempt | null>
  complete: (
    outcome: GoogleDataManagerViewItemAttemptOutcome
  ) => Promise<void>
}

function summarizeInvalidPayload(error: {
  issues: ReadonlyArray<{
    message: string
    path: ReadonlyArray<PropertyKey>
  }>
}) {
  const details = error.issues
    .slice(0, 10)
    .map(issue => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'event'
      return `${path}: ${issue.message}`
    })
    .join('; ')

  return `Invalid canonical view_item payload: ${details}`.slice(0, 1000)
}

function parseStoredPayload(payload: unknown): unknown {
  if (typeof payload !== 'string') return payload

  try {
    return JSON.parse(payload)
  } catch {
    return payload
  }
}

export function createGoogleDataManagerViewItemOutboxStore(
  database: GoogleDataManagerViewItemOutboxDatabase
): GoogleDataManagerViewItemOutboxStore {
  return {
    claimNext: async () => {
      for (
        let invalidRows = 0;
        invalidRows < MAX_INVALID_ROWS_PER_CLAIM;
        invalidRows += 1
      ) {
        const claimed = await database.claimNext()
        if (!claimed) return null

        const parsed = canonicalViewItemSchema.safeParse(
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
          attemptId: claimed.attemptId,
          errorMessage: summarizeInvalidPayload(parsed.error)
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
