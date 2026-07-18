import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  GoogleDataManagerStatusClaim,
  GoogleDataManagerStatusOutcome,
  GoogleDataManagerStatusStore
} from './googleDataManagerStatusTypes'
import { runGoogleDataManagerStatusReconciliation } from './runGoogleDataManagerStatusReconciliation'

function claim(index: number): GoogleDataManagerStatusClaim {
  return {
    attemptId: `attempt-${index}`,
    leaseToken: `lease-${index}`,
    requestId: `request-${index}`
  }
}

function result(
  claimed: GoogleDataManagerStatusClaim,
  status: 'SUCCESS' | 'PROCESSING'
): GoogleDataManagerStatusOutcome {
  return {
    claim: claimed,
    latencyMs: 10,
    result: {
      destinationStatuses: [status],
      overallStatus: status,
      requestId: claimed.requestId,
      response: {}
    },
    status: status === 'SUCCESS' ? 'succeeded' : 'processing'
  }
}

test('claims, reconciles and completes a bounded batch', async () => {
  const queue = [claim(1), claim(2)]
  const completed: GoogleDataManagerStatusOutcome[] = []
  const store: GoogleDataManagerStatusStore = {
    claimNext: async () => queue.shift() ?? null,
    complete: async outcome => {
      completed.push(outcome)
    }
  }

  const summary = await runGoogleDataManagerStatusReconciliation(
    { maxItems: 5 },
    {
      reconcileAttempt: async claimed =>
        result(
          claimed,
          claimed.attemptId === 'attempt-1' ?
            'SUCCESS'
          : 'PROCESSING'
        ),
      store
    }
  )

  assert.deepEqual(summary, {
    claimed: 2,
    deadLettered: 0,
    limitReached: false,
    processing: 1,
    retried: 0,
    succeeded: 1,
    unknown: 0
  })
  assert.deepEqual(
    completed.map(outcome => outcome.status).sort(),
    ['processing', 'succeeded']
  )
})

test('rejects invalid batch sizes', async () => {
  const store: GoogleDataManagerStatusStore = {
    claimNext: async () => null,
    complete: async () => undefined
  }

  for (const maxItems of [0, 1.5, 101]) {
    await assert.rejects(
      runGoogleDataManagerStatusReconciliation(
        { maxItems },
        {
          reconcileAttempt: async claimed =>
            result(claimed, 'SUCCESS'),
          store
        }
      ),
      /maxItems must be between 1 and 100/
    )
  }
})
