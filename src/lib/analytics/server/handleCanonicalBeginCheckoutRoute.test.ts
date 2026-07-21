import assert from 'node:assert/strict'
import test from 'node:test'
import { handleCanonicalBeginCheckoutRoute } from './handleCanonicalBeginCheckoutRoute'

function throwIfCalled(name: string) {
  return () => {
    throw new Error(`${name} must not be called`)
  }
}

test('accepted begin-checkout returns 202 without scheduling outbox drain', async () => {
  let runBatchCalled = false
  let scheduleAfterCalled = false
  const expectedResponse = new Response(null, { status: 202 })
  const request = new Request('https://utekos.no/api/events/begin-checkout', {
    method: 'POST'
  })

  const response = await handleCanonicalBeginCheckoutRoute(request, {
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

test('duplicate begin-checkout returns 200 without scheduling outbox drain', async () => {
  let runBatchCalled = false
  let scheduleAfterCalled = false
  const expectedResponse = new Response(null, { status: 200 })
  const request = new Request('https://utekos.no/api/events/begin-checkout', {
    method: 'POST'
  })

  const response = await handleCanonicalBeginCheckoutRoute(request, {
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

for (const status of [204, 400, 403, 413, 415, 500]) {
  test(`does not schedule processing for response status ${status}`, async () => {
    const expectedResponse = new Response(null, { status })
    const request = new Request('https://utekos.no/api/events/begin-checkout', {
      method: 'POST'
    })

    const response = await handleCanonicalBeginCheckoutRoute(request, {
      collect: async () => expectedResponse,
      runBatch: throwIfCalled('runBatch') as never,
      scheduleAfter: throwIfCalled('scheduleAfter') as never
    })

    assert.equal(response, expectedResponse)
    assert.equal(response.status, status)
  })
}

test('collect error propagates without scheduling outbox drain', async () => {
  const expectedError = new Error('collect failed')
  let runBatchCalled = false
  let scheduleAfterCalled = false
  const request = new Request('https://utekos.no/api/events/begin-checkout', {
    method: 'POST'
  })

  await assert.rejects(
    handleCanonicalBeginCheckoutRoute(request, {
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

test('collect is called exactly once', async () => {
  let collectCalls = 0
  const expectedResponse = new Response(null, { status: 202 })
  const request = new Request('https://utekos.no/api/events/begin-checkout', {
    method: 'POST'
  })

  const response = await handleCanonicalBeginCheckoutRoute(request, {
    collect: async (incoming) => {
      collectCalls += 1
      assert.equal(incoming, request)
      return expectedResponse
    },
    runBatch: async () => undefined,
    scheduleAfter: () => undefined
  })

  assert.equal(response, expectedResponse)
  assert.equal(collectCalls, 1)
})
