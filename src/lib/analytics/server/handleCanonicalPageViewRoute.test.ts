import assert from 'node:assert/strict'
import test from 'node:test'
import { handleCanonicalPageViewRoute } from './handleCanonicalPageViewRoute'

function throwIfCalled(name: string) {
  return () => {
    throw new Error(`${name} must not be called`)
  }
}

test('accepted page view returns 202 without scheduling outbox drain', async () => {
  let runBatchCalled = false
  let scheduleAfterCalled = false
  const expectedResponse = new Response(null, { status: 202 })
  const request = new Request('https://utekos.no/api/events/page-view')

  const response = await handleCanonicalPageViewRoute(request, {
    collect: async () => expectedResponse,
    runBatch: async () => {
      runBatchCalled = true
    },
    scheduleAfter: () => {
      scheduleAfterCalled = true
    }
  })

  assert.equal(response, expectedResponse)
  assert.equal(response.status, 202)
  assert.equal(runBatchCalled, false)
  assert.equal(scheduleAfterCalled, false)
})

test('duplicate page view returns 200 without scheduling outbox drain', async () => {
  let runBatchCalled = false
  let scheduleAfterCalled = false
  const expectedResponse = new Response(null, { status: 200 })
  const request = new Request('https://utekos.no/api/events/page-view')

  const response = await handleCanonicalPageViewRoute(request, {
    collect: async () => expectedResponse,
    runBatch: async () => {
      runBatchCalled = true
    },
    scheduleAfter: () => {
      scheduleAfterCalled = true
    }
  })

  assert.equal(response, expectedResponse)
  assert.equal(response.status, 200)
  assert.equal(runBatchCalled, false)
  assert.equal(scheduleAfterCalled, false)
})

test('rejected page view returns collect response without scheduling outbox drain', async () => {
  const expectedResponse = new Response(null, { status: 204 })
  const request = new Request('https://utekos.no/api/events/page-view')

  const response = await handleCanonicalPageViewRoute(request, {
    collect: async () => expectedResponse,
    runBatch: throwIfCalled('runBatch') as never,
    scheduleAfter: throwIfCalled('scheduleAfter') as never
  })

  assert.equal(response, expectedResponse)
  assert.equal(response.status, 204)
})

test('collect error propagates without scheduling outbox drain', async () => {
  const expectedError = new Error('collect failed')
  let runBatchCalled = false
  let scheduleAfterCalled = false
  const request = new Request('https://utekos.no/api/events/page-view')

  await assert.rejects(
    handleCanonicalPageViewRoute(request, {
      collect: async () => {
        throw expectedError
      },
      runBatch: async () => {
        runBatchCalled = true
      },
      scheduleAfter: () => {
        scheduleAfterCalled = true
      }
    }),
    (error) => error === expectedError
  )

  assert.equal(runBatchCalled, false)
  assert.equal(scheduleAfterCalled, false)
})
