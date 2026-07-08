import assert from 'node:assert/strict'
import test from 'node:test'

import { toNumericGaSessionId, toNumericGaSessionIdString } from './toNumericGaSessionId'

test('toNumericGaSessionId accepts numeric session ids', () => {
  assert.equal(toNumericGaSessionId('1783504222'), 1783504222)
  assert.equal(toNumericGaSessionId(1783504222), 1783504222)
})

test('toNumericGaSessionId parses GS2 session cookie values', () => {
  assert.equal(
    toNumericGaSessionId('s1783504222$o1$g1$t1783504228$j54$l0$h2128332871'),
    1783504222
  )
})

test('toNumericGaSessionId parses legacy dotted GA session cookie values', () => {
  assert.equal(toNumericGaSessionId('GS1.1.1783504222.1.1.1783504228.0.0.0'), 1783504222)
})

test('toNumericGaSessionIdString returns normalized string value', () => {
  assert.equal(
    toNumericGaSessionIdString('s1783504222$o1$g1$t1783504228$j54$l0$h2128332871'),
    '1783504222'
  )
})
