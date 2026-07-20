import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ensureFbclidFromFbc,
  extractFbclidFromFbc
} from './extractFbclidFromFbc'

test('extracts fbclid from classic four-segment fbc values', () => {
  assert.equal(
    extractFbclidFromFbc('fb.1.1784195000000.meta-click'),
    'meta-click'
  )
})

test('extracts fbclid from Parameter Builder appendix values', () => {
  assert.equal(
    extractFbclidFromFbc(
      'fb.1.1784477611824.IwY2xjawExampleClickId.AQQCAQMB'
    ),
    'IwY2xjawExampleClickId'
  )
})

test('returns undefined for malformed fbc values', () => {
  assert.equal(extractFbclidFromFbc(undefined), undefined)
  assert.equal(extractFbclidFromFbc(''), undefined)
  assert.equal(extractFbclidFromFbc('fb.1.123'), undefined)
  assert.equal(extractFbclidFromFbc('xx.1.123.click'), undefined)
})

test('ensureFbclidFromFbc derives fbclid from appendix-bearing fbc cookies', () => {
  assert.deepEqual(
    ensureFbclidFromFbc({
      browser_id: {
        fbc: 'fb.1.1784477611824.IwY2xjawExample.AQQCAQMB'
      }
    }),
    { fbclid: 'IwY2xjawExample' }
  )
})

test('ensureFbclidFromFbc keeps an existing fbclid', () => {
  assert.deepEqual(
    ensureFbclidFromFbc({
      browser_id: {
        fbc: 'fb.1.1784477611824.other-click.AQQCAQMB'
      },
      click_id: { fbclid: 'existing-click', gclid: 'google-1' }
    }),
    { fbclid: 'existing-click', gclid: 'google-1' }
  )
})
