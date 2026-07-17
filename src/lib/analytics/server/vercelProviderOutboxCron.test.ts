import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { resolve } from 'node:path'

type VercelConfiguration = {
  crons?: Array<{ path: string; schedule: string }>
}

test('schedules only the generic provider outbox retry route', () => {
  const configuration = JSON.parse(
    readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
  ) as VercelConfiguration

  assert.deepEqual(configuration.crons, [
    {
      path: '/api/cron/provider-outbox-dispatch',
      schedule: '*/5 * * * *'
    }
  ])
})
