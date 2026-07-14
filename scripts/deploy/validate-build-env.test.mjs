import assert from 'node:assert/strict'
import test from 'node:test'

import { z } from 'zod'

import { validateBuildEnv } from './validate-build-env.mjs'

test('skips the Vercel-only gate for local builds', () => {
  assert.deepEqual(validateBuildEnv({}), { checked: false })
})

test('rejects an empty Klarna Client Identifier on Vercel', () => {
  assert.throws(
    () =>
      validateBuildEnv({
        VERCEL: '1',
        NEXT_PUBLIC_KLARNA_CLIENT_ID: ''
      }),
    z.ZodError
  )
})

test('accepts a configured Klarna Client Identifier on Vercel', () => {
  assert.deepEqual(
    validateBuildEnv({
      VERCEL: '1',
      NEXT_PUBLIC_KLARNA_CLIENT_ID:
        'klarna_live_client_verified'
    }),
    { checked: true }
  )
})
