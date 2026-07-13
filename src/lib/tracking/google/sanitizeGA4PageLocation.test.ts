import assert from 'node:assert/strict'
import test from 'node:test'
import { sanitizeGA4PageLocation } from './sanitizeGA4PageLocation'

test('removes query and hash from GA4 Measurement Protocol page_location', () => {
  assert.equal(
    sanitizeGA4PageLocation(
      'https://utekos.no/skreddersy-varmen?utm_source=facebook#checkout'
    ),
    'https://utekos.no/skreddersy-varmen'
  )
})

test('keeps a 100-character GA4 Measurement Protocol page_location', () => {
  const prefix = 'https://utekos.no/'
  const pageLocation = `${prefix}${'a'.repeat(100 - prefix.length)}`

  assert.equal(sanitizeGA4PageLocation(pageLocation), pageLocation)
})

test('omits page_location values over 100 characters', () => {
  const prefix = 'https://utekos.no/'
  const pageLocation = `${prefix}${'a'.repeat(101 - prefix.length)}`

  assert.equal(sanitizeGA4PageLocation(pageLocation), undefined)
})

test('omits invalid or non-string page_location values', () => {
  assert.equal(sanitizeGA4PageLocation('/relative-path'), undefined)
  assert.equal(sanitizeGA4PageLocation(123), undefined)
})
