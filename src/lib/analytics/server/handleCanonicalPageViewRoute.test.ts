import assert from 'node:assert/strict'
import test from 'node:test'
import { handleCanonicalPageViewRoute } from './handleCanonicalPageViewRoute'

test('schedules immediate processing for a newly accepted page view', async () => {
  const scheduled: Array<() => Promise<void>> = []
  const batchSizes: number[] = []
  const response = await handleCanonicalPageViewRoute(
    new Request('https://utekos.no/api/events/page-view'),
    {
      collect: async () => new Response(null, { status: 202 }),
      runBatch: async input => {
        batchSizes.push(input.maxItems)
      },
      scheduleAfter: task => {
        scheduled.push(task)
      }
    }
  )

  assert.equal(response.status, 202)
  assert.equal(scheduled.length, 1)
  await scheduled[0]?.()
  assert.deepEqual(batchSizes, [1])
})

test('does not schedule processing for a rejected page view', async () => {
  let scheduled = false
  const response = await handleCanonicalPageViewRoute(
    new Request('https://utekos.no/api/events/page-view'),
    {
      collect: async () => new Response(null, { status: 204 }),
      runBatch: async () => undefined,
      scheduleAfter: () => {
        scheduled = true
      }
    }
  )

  assert.equal(response.status, 204)
  assert.equal(scheduled, false)
})
