import assert from 'node:assert/strict'
import test from 'node:test'
import { buildGA4BrowserEventParams } from './buildGA4BrowserEventParams'

test('builds GA4 browser fallback params with event identity and source URL', () => {
  const params = buildGA4BrowserEventParams({
    eventId: 'select-event',
    eventSourceUrl: 'https://utekos.no/produkter/test',
    eventData: {
      currency: 'NOK',
      value: 1,
      contents: [
        {
          id: 'variant-1',
          item_name: 'Test product',
          item_price: 1,
          quantity: 1
        }
      ]
    }
  })

  assert.equal(params.currency, 'NOK')
  assert.equal(params.value, 1)
  assert.equal(params.event_id, 'select-event')
  assert.equal(params.page_location, 'https://utekos.no/produkter/test')
  assert.deepEqual(params.items, [
    {
      item_id: 'variant-1',
      item_name: 'Test product',
      index: 0,
      quantity: 1,
      price: 1
    }
  ])
})

test('removes query and hash from GA4 page_location', () => {
  const params = buildGA4BrowserEventParams({
    eventId: 'landing-event',
    eventSourceUrl: 'https://utekos.no/skreddersy-varmen?utm_source=facebook&fbclid=test#checkout',
    eventData: {}
  })

  assert.equal(params.page_location, 'https://utekos.no/skreddersy-varmen')
})

test('keeps 100-character GA4 Measurement Protocol page_location values', () => {
  const prefix = 'https://utekos.no/'
  const eventSourceUrl = `${prefix}${'a'.repeat(100 - prefix.length)}`
  const params = buildGA4BrowserEventParams({
    eventId: 'max-length-event',
    eventSourceUrl,
    eventData: {}
  })

  assert.equal(params.page_location, eventSourceUrl)
})

test('omits 101-character GA4 Measurement Protocol page_location values', () => {
  const prefix = 'https://utekos.no/'
  const params = buildGA4BrowserEventParams({
    eventId: 'oversized-event',
    eventSourceUrl: `${prefix}${'a'.repeat(101 - prefix.length)}`,
    eventData: {}
  })

  assert.equal(params.page_location, undefined)
})
