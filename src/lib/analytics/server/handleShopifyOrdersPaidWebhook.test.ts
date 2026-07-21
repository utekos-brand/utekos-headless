import assert from 'node:assert/strict'
import Module from 'node:module'
import { createRequire } from 'node:module'
import test from 'node:test'
import { ZodError } from 'zod'

const moduleWithLoad = Module as typeof Module & {
  _load: (
    request: string,
    parent: NodeModule | null,
    isMain: boolean
  ) => unknown
}
const originalLoad = moduleWithLoad._load.bind(Module)

moduleWithLoad._load = (request, parent, isMain) => {
  if (request === 'server-only') {
    return {}
  }

  return originalLoad(request, parent, isMain)
}

const require = createRequire(import.meta.url)
const { handleShopifyOrdersPaidWebhook } = require(
  './handleShopifyOrdersPaidWebhook.ts'
) as {
  handleShopifyOrdersPaidWebhook: (
    request: Request,
    dependencies?: {
      acceptPurchase?: (input: unknown) => Promise<{
        event_id: string
        status: 'accepted' | 'duplicate'
      }>
      mapOrder?: (payload: unknown) => unknown
      verifyWebhook?: (rawBody: string, hmac: string) => boolean
    }
  ) => Promise<Response>
}

const EVENT_ID = 'purchase_evt_test_001'
const ORDER_BODY = JSON.stringify({ id: 12345 })

function throwIfCalled(name: string) {
  return () => {
    throw new Error(`${name} must not be called`)
  }
}

function createRequest(body: string, hmac = 'valid-hmac') {
  return new Request(
    'https://utekos.no/api/shopify/webhooks/orders-paid',
    {
      method: 'POST',
      headers: {
        'x-shopify-hmac-sha256': hmac
      },
      body
    }
  )
}

test('accepted purchase returns 202', async () => {
  const acceptCalls: unknown[] = []

  const response = await handleShopifyOrdersPaidWebhook(
    createRequest(ORDER_BODY),
    {
      verifyWebhook: () => true,
      mapOrder: payload => payload,
      acceptPurchase: async input => {
        acceptCalls.push(input)
        return { event_id: EVENT_ID, status: 'accepted' }
      }
    }
  )

  assert.equal(response.status, 202)
  assert.deepEqual(await response.json(), {
    event_id: EVENT_ID,
    status: 'accepted'
  })
  assert.equal(acceptCalls.length, 1)
})

test('duplicate purchase returns 200', async () => {
  const response = await handleShopifyOrdersPaidWebhook(
    createRequest(ORDER_BODY),
    {
      verifyWebhook: () => true,
      mapOrder: payload => payload,
      acceptPurchase: async () => ({
        event_id: EVENT_ID,
        status: 'duplicate'
      })
    }
  )

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    event_id: EVENT_ID,
    status: 'duplicate'
  })
})

test('invalid HMAC returns 401 and does not map or accept', async () => {
  const response = await handleShopifyOrdersPaidWebhook(
    createRequest(ORDER_BODY, 'bad-hmac'),
    {
      verifyWebhook: () => false,
      mapOrder: throwIfCalled('mapOrder') as never,
      acceptPurchase: throwIfCalled('acceptPurchase') as never
    }
  )

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), {
    error: 'invalid_webhook_signature'
  })
})

test('invalid JSON returns 400 and does not accept', async () => {
  const response = await handleShopifyOrdersPaidWebhook(
    createRequest('{not-json'),
    {
      verifyWebhook: () => true,
      mapOrder: throwIfCalled('mapOrder') as never,
      acceptPurchase: throwIfCalled('acceptPurchase') as never
    }
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'invalid_json' })
})

test('Zod invalid event returns 400', async () => {
  const response = await handleShopifyOrdersPaidWebhook(
    createRequest(ORDER_BODY),
    {
      verifyWebhook: () => true,
      mapOrder: () => {
        throw new ZodError([])
      },
      acceptPurchase: throwIfCalled('acceptPurchase') as never
    }
  )

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'invalid_event' })
})

test('accept failure returns 500', async () => {
  const response = await handleShopifyOrdersPaidWebhook(
    createRequest(ORDER_BODY),
    {
      verifyWebhook: () => true,
      mapOrder: payload => payload,
      acceptPurchase: async () => {
        throw new Error('persist failed')
      }
    }
  )

  assert.equal(response.status, 500)
  assert.deepEqual(await response.json(), { error: 'internal_error' })
})
