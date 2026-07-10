import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

type VercelConfig = {
  crons?: Array<{ path: string; schedule: string }> | undefined
}

test('keeps approval-gated dead-letter replay out of automatic cron schedules', () => {
  const config = JSON.parse(
    readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')
  ) as VercelConfig

  assert.equal(
    config.crons?.some(cron => cron.path === '/api/cron/replay-dead-letter'),
    false
  )
})
