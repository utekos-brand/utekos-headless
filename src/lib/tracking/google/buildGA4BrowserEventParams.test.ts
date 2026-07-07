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
