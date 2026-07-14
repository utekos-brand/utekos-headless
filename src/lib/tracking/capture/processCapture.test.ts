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
  userAgent: 'node:test',
  consentProvenance: {
    schemaVersion: 1,
    source: 'cookiebot',
    capturedAt: '2026-07-12T10:00:00.000Z',
    services: {
      googleAnalytics: true,
      googleAds: true,
      meta: true,
      microsoftAdvertising: true
    }
  }
}

test('retains only identifiers authorized by provider-specific consent', async () => {
  const writes: CheckoutAttribution[] = []
  const statisticsOnlyContext: CaptureContext = {
    ...context,
    consentProvenance: {
      ...context.consentProvenance,
      services: {
        googleAnalytics: true,
        googleAds: false,
        meta: false,
        microsoftAdvertising: false
      }
    }
  }

  await processCapture(
    'checkout-token',
    {
      checkoutUrl: 'https://checkout.utekos.no/checkouts/cn/checkout-token',
      userData: { email: 'kunde@example.com', fbp: 'fb.1.test' }
    },
    statisticsOnlyContext,
    {
      redisSet: async (_key, value) => {
        writes.push(value)
      },
      logger: async () => {}
    }
  )

  assert.equal(writes[0]?.ga_client_id, '123.456')
  assert.equal(writes[0]?.ga_session_id, '789')
  assert.equal(writes[0]?.msclkid, undefined)
  assert.equal(writes[0]?.userData.email, undefined)
  assert.equal(writes[0]?.userData.fbp, undefined)
  assert.deepEqual(writes[0]?.consentProvenance, statisticsOnlyContext.consentProvenance)
})

test('stores checkout attribution under every webhook lookup token', async () => {
  const writes: Array<{ key: string; value: CheckoutAttribution; ttlSeconds: number | undefined }> = []
  const snapshots: Array<{ value: CheckoutAttribution; storageTokens: string[] }> = []

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
      persistCheckoutAttributionSnapshot: async (value, storageTokens) => {
        snapshots.push({ value, storageTokens })
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
  assert.deepEqual(snapshots.map(snapshot => snapshot.storageTokens), [
    ['checkout-token', 'cart-token', 'cart-id-token']
  ])
  assert.equal(snapshots[0]?.value.eventId, 'ic_123')
})

test('does not fail capture when attribution snapshot persistence fails', async () => {
  const logMessages: string[] = []

  const result = await processCapture(
    'checkout-token',
    {
      cartId: 'gid://shopify/Cart/cart-id-token',
      checkoutUrl: 'https://checkout.utekos.no/checkouts/cn/checkout-token?key=cart-token',
      eventId: 'ic_456'
    },
    context,
    {
      redisSet: async () => {},
      persistCheckoutAttributionSnapshot: async () => {
        throw new Error('warehouse unavailable')
      },
      logger: async (_level, message) => {
        logMessages.push(message)
      }
    }
  )

  assert.deepEqual(result, { success: true })
  assert.ok(logMessages.includes('Checkout attribution snapshot persistence failed'))
})
