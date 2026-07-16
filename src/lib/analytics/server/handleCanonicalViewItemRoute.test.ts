import assert from 'node:assert/strict'
import test from 'node:test'
import {
  handleCanonicalViewItemRoute,
  type CanonicalViewItemRouteDependencies
} from './handleCanonicalViewItemRoute'

type ScheduledTask = () => Promise<void>

const batchSummary = {
  google: {
    acceptedUnverified: 1,
    claimed: 1,
    deadLettered: 0,
    limitReached: true,
    retryScheduled: 0
  },
  meta: {
    acceptedUnverified: 1,
    claimed: 1,
    deadLettered: 0,
    limitReached: true,
    retryScheduled: 0
  }
} as const

function createHarness(status: number) {
  const response = new Response(null, { status })
  const scheduledTasks: ScheduledTask[] = []
  const batchInputs: Array<{ maxItems: number }> = []

  const dependencies: CanonicalViewItemRouteDependencies = {
    collect: async () => response,
    runBatch: async input => {
      batchInputs.push(input)
      return batchSummary
    },
    scheduleAfter: task => {
      scheduledTasks.push(task)
    }
  }

  return {
    batchInputs,
    dependencies,
    response,
    scheduledTasks
  }
}

test('schedules one immediate outbox item after an accepted event', async () => {
  const harness = createHarness(202)

  const response = await handleCanonicalViewItemRoute(
    new Request('https://utekos.no/api/events/view-item', {
      method: 'POST'
    }),
    harness.dependencies
  )

  assert.equal(response, harness.response)
  assert.equal(harness.scheduledTasks.length, 1)
  assert.deepEqual(harness.batchInputs, [])

  await harness.scheduledTasks[0]?.()

  assert.deepEqual(harness.batchInputs, [{ maxItems: 1 }])
})

test('schedules immediate processing for a duplicate event', async () => {
  const harness = createHarness(200)

  await handleCanonicalViewItemRoute(
    new Request('https://utekos.no/api/events/view-item', {
      method: 'POST'
    }),
    harness.dependencies
  )

  assert.equal(harness.scheduledTasks.length, 1)
})

for (const status of [204, 400, 403, 413, 415, 500]) {
  test(`does not schedule processing for response status ${status}`, async () => {
    const harness = createHarness(status)

    await handleCanonicalViewItemRoute(
      new Request('https://utekos.no/api/events/view-item', {
        method: 'POST'
      }),
      harness.dependencies
    )

    assert.deepEqual(harness.scheduledTasks, [])
    assert.deepEqual(harness.batchInputs, [])
  })
}

test('keeps a background failure observable without changing the response', async () => {
  const harness = createHarness(202)
  const expectedError = new Error('Provider unavailable')
  harness.dependencies.runBatch = async () => {
    throw expectedError
  }

  const response = await handleCanonicalViewItemRoute(
    new Request('https://utekos.no/api/events/view-item', {
      method: 'POST'
    }),
    harness.dependencies
  )

  assert.equal(response, harness.response)
  await assert.rejects(
    harness.scheduledTasks[0]?.() ?? Promise.resolve(),
    expectedError
  )
})
