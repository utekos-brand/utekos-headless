import assert from 'node:assert/strict'
import test from 'node:test'
import type { GoogleDataManagerIngestionClient } from './createGoogleDataManagerIngestionClient'
import { retrieveGoogleDataManagerRequestStatus } from './retrieveGoogleDataManagerRequestStatus'

function client(
  requestStatus: string
): GoogleDataManagerIngestionClient {
  return {
    ingestEvents: async () => [{}],
    retrieveRequestStatus: async () => [
      {
        requestStatusPerDestination: [
          {
            destination: {
              loginAccount: {
                accountId: '489598217',
                accountType: 'GOOGLE_ANALYTICS_PROPERTY' as never
              },
              productDestinationId: 'G-FCES3L0M9M'
            },
            requestStatus: requestStatus as never
          }
        ]
      }
    ]
  }
}

test('normalizes a provider-confirmed success', async () => {
  const result = await retrieveGoogleDataManagerRequestStatus(
    ' request-1 ',
    { createClient: () => client('SUCCESS') }
  )

  assert.equal(result.requestId, 'request-1')
  assert.equal(result.overallStatus, 'SUCCESS')
  assert.deepEqual(result.destinationStatuses, ['SUCCESS'])
  assert.deepEqual(result.response.requestStatusPerDestination, [
    {
      destination: {
        loginAccount: {
          accountId: '489598217',
          accountType: 'GOOGLE_ANALYTICS_PROPERTY'
        },
        productDestinationId: 'G-FCES3L0M9M'
      },
      requestStatus: 'SUCCESS'
    }
  ])
})

test('keeps processing and unknown responses retryable', async () => {
  for (const [input, expected] of [
    ['PROCESSING', 'PROCESSING'],
    ['NOT_A_STATUS', 'REQUEST_STATUS_UNKNOWN']
  ] as const) {
    const result = await retrieveGoogleDataManagerRequestStatus(
      'request-2',
      { createClient: () => client(input) }
    )

    assert.equal(result.overallStatus, expected)
  }
})

test('requires a request ID', async () => {
  await assert.rejects(
    retrieveGoogleDataManagerRequestStatus(' ', {
      createClient: () => client('SUCCESS')
    }),
    /requestId is required/
  )
})
