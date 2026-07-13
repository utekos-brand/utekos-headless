import assert from 'node:assert/strict'
import test from 'node:test'
import { sanitizeGA4EventParams } from './sanitizeGA4EventParams'

test('sanitizes page_location without changing other GA4 event params', () => {
  const params = sanitizeGA4EventParams({
    event_id: 'event-1',
    currency: 'NOK',
    page_location: 'https://utekos.no/produkter/test?variant=123#details'
  })

  assert.deepEqual(params, {
    event_id: 'event-1',
    currency: 'NOK',
    page_location: 'https://utekos.no/produkter/test'
  })
})

test('removes an overlong page_location from central GA4 event params', () => {
  const prefix = 'https://utekos.no/'
  const params = sanitizeGA4EventParams({
    event_id: 'event-2',
    page_location: `${prefix}${'a'.repeat(101 - prefix.length)}`
  })

  assert.deepEqual(params, { event_id: 'event-2' })
})
