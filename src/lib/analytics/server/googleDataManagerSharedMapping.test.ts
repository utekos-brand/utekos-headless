import assert from 'node:assert/strict'
import test from 'node:test'
import { mapGoogleDataManagerTimestamp } from './googleDataManagerSharedMapping'

test('preserves a valid event timestamp that is not in the future', () => {
  const mapped = mapGoogleDataManagerTimestamp(
    '2026-07-18T15:43:13.679Z',
    Date.parse('2026-07-18T15:43:15.000Z')
  )

  assert.deepEqual(mapped, {
    seconds: 1784389393,
    nanos: 679000000
  })
})

test('clamps browser clock skew to the server dispatch time', () => {
  const mapped = mapGoogleDataManagerTimestamp(
    '2026-07-18T15:43:13.679Z',
    Date.parse('2026-07-18T15:43:12.391Z')
  )

  assert.deepEqual(mapped, {
    seconds: 1784389392,
    nanos: 391000000
  })
})
