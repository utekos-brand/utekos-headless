import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { resolve } from 'node:path'

type VercelConfiguration = {
  crons?: Array<{ path: string; schedule: string }>
}

test('schedules provider dispatch and Data Manager status reconciliation', () => {
  const configuration = JSON.parse(
    readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
  ) as VercelConfiguration

  assert.deepEqual(configuration.crons, [
    {
      path: '/api/cron/provider-outbox-dispatch',
      schedule: '*/5 * * * *'
    },
    {
      path: '/api/cron/google-data-manager-status',
      schedule: '*/5 * * * *'
    }
  ])
})
