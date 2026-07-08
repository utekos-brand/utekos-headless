import assert from 'node:assert/strict'
import test from 'node:test'

import { processCapture } from './processCapture'
import type { CaptureContext } from 'types/tracking/capture'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'

const context: CaptureContext = {
  cookies: {
    msclkid: 'dd4afcccb1c9a4cad9544dd7e5006',
    gaClientId: '123.456',
    gaSessionId: '789'
  },
  clientIp: '203.0.113.10',
  userAgent: 'node:test'
}

test('stores checkout attribution under every webhook lookup token', async () => {
  const writes: Array<{ key: string; value: CheckoutAttribution; ttlSeconds: number | undefined }> = []

  const result = await processCapture(
    ['checkout-token', 'cart-token', 'cart-id-token'],
    {
      cartId: 'gid://shopify/Cart/cart-id-token',
      checkoutUrl: 'https://checkout.utekos.no/checkouts/cn/checkout-token?key=cart-token',
      eventId: 'ic_123'
    },
    context,
    {
      redisSet: async (key, value, ttlSeconds) => {
        writes.push({ key, value, ttlSeconds })
      },
      logger: async () => {}
    }
  )

  assert.deepEqual(result, { success: true })
  assert.deepEqual(
    writes.map(write => write.key),
    ['checkout:checkout-token', 'checkout:cart-token', 'checkout:cart-id-token']
  )
  assert.ok(writes.every(write => write.ttlSeconds === 604800))
  assert.ok(writes.every(write => write.value.msclkid === 'dd4afcccb1c9a4cad9544dd7e5006'))
})
