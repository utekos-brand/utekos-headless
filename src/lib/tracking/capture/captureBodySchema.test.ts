import assert from 'node:assert/strict'
import test from 'node:test'
import { captureBodySchema } from './captureBodySchema'

test('rejects malformed checkout capture input', () => {
  assert.equal(captureBodySchema.safeParse({ checkoutUrl: 'not-a-url' }).success, false)
  assert.equal(captureBodySchema.safeParse({ checkoutUrl: 'https://checkout.utekos.no', gaClientId: 42 }).success, false)
})

test('accepts a bounded checkout identifier payload', () => {
  const result = captureBodySchema.safeParse({
    cartId: 'gid://shopify/Cart/test',
    checkoutUrl: 'https://checkout.utekos.no/checkouts/test',
    eventId: 'evt_123',
    gaClientId: '123.456',
    gaSessionId: '789'
  })

  assert.equal(result.success, true)
})
