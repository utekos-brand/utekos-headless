import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const scripts = [
  'scripts/ops/backfill-july16-google-data-manager-purchases.ts',
  'scripts/ops/force-resend-meta-purchases-jul19.ts'
] as const

for (const script of scripts) {
  test(`${script} fails closed before credentials, database, or provider access`, () => {
    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', script],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: { ...process.env, PATH: process.env.PATH ?? '' }
      }
    )

    assert.notEqual(result.status, 0)
    assert.match(
      `${result.stdout}\n${result.stderr}`,
      /CE_2_4_PURCHASE_BACKFILL_DISABLED/
    )
  })

  test(`${script} contains no direct Purchase dispatch or ledger mutation`, () => {
    const source = readFileSync(script, 'utf8')

    assert.doesNotMatch(
      source,
      /dispatchCanonicalPurchaseTo|randomUUID|marketing\.event_ledger|ops\.provider_dispatch_attempts/
    )
  })
}
