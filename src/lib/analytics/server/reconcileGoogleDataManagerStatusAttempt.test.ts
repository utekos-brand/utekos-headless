import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  GoogleDataManagerProviderStatus,
  GoogleDataManagerStatusClaim
} from './googleDataManagerStatusTypes'
import { reconcileGoogleDataManagerStatusAttempt } from './reconcileGoogleDataManagerStatusAttempt'

const claim: GoogleDataManagerStatusClaim = {
  attemptId: 'attempt-1',
  leaseToken: 'lease-1',
  requestId: 'request-1'
}

function clocks() {
  const values = [1_000, 1_125]
  return () => values.shift() ?? 1_125
}

test('maps every provider status to the matching outbox outcome', async () => {
  for (const [providerStatus, outcomeStatus] of [
    ['SUCCESS', 'succeeded'],
    ['PROCESSING', 'processing'],
    ['FAILED', 'failed'],
    ['PARTIAL_SUCCESS', 'partial_success'],
    ['REQUEST_STATUS_UNKNOWN', 'unknown']
  ] as const) {
    const outcome =
      await reconcileGoogleDataManagerStatusAttempt(claim, {
        now: clocks(),
        retrieveStatus: async requestId => ({
          destinationStatuses: [
            providerStatus as GoogleDataManagerProviderStatus
          ],
          overallStatus: providerStatus,
          requestId,
          response: {}
        })
      })

    assert.equal(outcome.status, outcomeStatus)
    assert.equal(outcome.latencyMs, 125)
  }
})

test('turns status API errors into bounded retries', async () => {
  const outcome = await reconcileGoogleDataManagerStatusAttempt(
    claim,
    {
      now: clocks(),
      retrieveStatus: async () => {
        throw new Error('temporary status error')
      }
    }
  )

  assert.equal(outcome.status, 'retry')
  assert.equal(outcome.latencyMs, 125)
  assert.equal(
    outcome.status === 'retry' ? outcome.errorMessage : null,
    'temporary status error'
  )
})
