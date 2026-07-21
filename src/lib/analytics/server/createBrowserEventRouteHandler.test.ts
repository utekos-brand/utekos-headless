import assert from 'node:assert/strict'
import test from 'node:test'
import { createBrowserEventRouteHandler } from './createBrowserEventRouteHandler'

function throwIfCalled(name: string) {
  return () => {
    throw new Error(`${name} must not be called`)
  }
}

async function invokeHandler(status: number) {
  const collectCalls: Request[] = []
  const request = new Request('https://utekos.no/api/events/page-view', {
    method: 'POST'
  })
  const handleRoute = createBrowserEventRouteHandler('page-view')

  const response = await handleRoute(request, {
    collect: async (incoming) => {
      collectCalls.push(incoming)
      return new Response(null, { status })
    },
    runBatch: throwIfCalled('runBatch') as never,
    scheduleAfter: throwIfCalled('scheduleAfter') as never
  })

  return { response, collectCalls, request }
}

test('accepted event returns collect response without scheduling outbox drain', async () => {
  const { response, collectCalls, request } = await invokeHandler(202)

  assert.equal(response.status, 202)
  assert.equal(collectCalls.length, 1)
  assert.equal(collectCalls[0], request)
})

test('duplicate or already-processed event returns collect response without scheduling outbox drain', async () => {
  const { response, collectCalls, request } = await invokeHandler(200)

  assert.equal(response.status, 200)
  assert.equal(collectCalls.length, 1)
  assert.equal(collectCalls[0], request)
})

test('invalid event returns collect response without scheduling outbox drain', async () => {
  const { response, collectCalls, request } = await invokeHandler(400)

  assert.equal(response.status, 400)
  assert.equal(collectCalls.length, 1)
  assert.equal(collectCalls[0], request)
})

test('collect error propagates without scheduling outbox drain', async () => {
  const expectedError = new Error('collect failed')
  const collectCalls: Request[] = []
  let runBatchCalled = false
  let scheduleAfterCalled = false
  const request = new Request('https://utekos.no/api/events/page-view', {
    method: 'POST'
  })
  const handleRoute = createBrowserEventRouteHandler('page-view')

  await assert.rejects(
    handleRoute(request, {
      collect: async (incoming) => {
        collectCalls.push(incoming)
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

  assert.equal(collectCalls.length, 1)
  assert.equal(collectCalls[0], request)
  assert.equal(runBatchCalled, false)
  assert.equal(scheduleAfterCalled, false)
})

test('handler accepts collect-only dependencies without dispatch wiring', async () => {
  const collectCalls: Request[] = []
  const request = new Request('https://utekos.no/api/events/filter-apply', {
    method: 'POST'
  })
  const expectedResponse = new Response(null, { status: 202 })
  const handleRoute = createBrowserEventRouteHandler('filter-apply')

  const response = await handleRoute(request, {
    collect: async (incoming) => {
      collectCalls.push(incoming)
      return expectedResponse
    }
  })

  assert.equal(response, expectedResponse)
  assert.equal(response.status, 202)
  assert.equal(collectCalls.length, 1)
  assert.equal(collectCalls[0], request)
})
