import assert from 'node:assert/strict'
import test from 'node:test'
import { canonicalBeginCheckoutSchema } from '../beginCheckoutEvent'
import {
  MicrosoftUetCapiConfigError,
  MicrosoftUetCapiHttpError
} from './sendMicrosoftUetCapiPurchase'
import { sendMicrosoftUetCapiBeginCheckout } from './sendMicrosoftUetCapiBeginCheckout'

function beginCheckout(overrides: Record<string, unknown> = {}) {
  return canonicalBeginCheckoutSchema.parse({
    schema_version: 1,
    event_name: 'begin_checkout',
    event_id: '71c2ef59-6e6f-4f56-a63a-567ca398f9de',
    event_time: '2026-07-17T10:10:00.000Z',
    source: 'web',
    environment: 'test',
    page_url: 'https://utekos.no/checkout',
    page_title: 'Checkout',
    consent: {
      analytics: 'granted',
      marketing: 'granted',
      preferences: 'denied',
      source: 'cookiebot',
      version: '1'
    },
    click_id: {
      msclkid: 'dd4afcccb1c9a4cad9544dd7e5006'
    },
    custom_data: {
      currency: 'NOK',
      value: 100,
      gross_value: 100,
      tax_value: 20,
      cart_id: 'cart_1',
      checkout_id: 'checkout_1',
      creation_revision: '1',
      items: [
        {
          available_for_sale: true,
          collection_ids: [],
          collection_titles: [],
          currently_not_in_stock: false,
          gross_unit_price: 100,
          item_id: '1',
          item_name: 'Item',
          price_includes_tax: true,
          product_handle: 'item',
          product_id: 'gid://shopify/Product/1',
          quantity: 1,
          quantity_available: 1,
          selected_options: [],
          tax_amount: 20,
          tax_rate: 0.25,
          taxable: true,
          unit_price: 100,
          variant_id: 'gid://shopify/ProductVariant/1'
        }
      ]
    },
    ...overrides
  })
}

test('posts begin_checkout events to the Microsoft UET CAPI endpoint', async () => {
  const calls: Array<{ body: string; url: string }> = []

  const result = await sendMicrosoftUetCapiBeginCheckout(
    beginCheckout(),
    {
      fetchFn: async (url, init) => {
        calls.push({
          body: String(init.body),
          url
        })

        return {
          headers: new Headers({ 'x-ms-request-id': 'req-bc-1' }),
          ok: true,
          status: 200,
          text: async () => ''
        }
      },
      readConfig: () => ({
        apiToken: 'test-token',
        tagId: '97247724'
      }),
      resolveToken: () => undefined
    }
  )

  assert.equal(calls.length, 1)
  assert.equal(
    calls[0]?.url,
    'https://capi.uet.microsoft.com/v1/97247724/events'
  )
  assert.match(calls[0]?.body ?? '', /"eventName":"begin_checkout"/)
  assert.match(calls[0]?.body ?? '', /"pageType":"cart"/)
  assert.equal(result.eventName, 'begin_checkout')
  assert.equal(result.requestId, 'req-bc-1')
  assert.equal(result.status, 200)
  assert.equal(result.tagId, '97247724')
})

test('fails closed without msclkid', async () => {
  await assert.rejects(
    () =>
      sendMicrosoftUetCapiBeginCheckout(
        beginCheckout({ click_id: { fbclid: 'only-meta' } }),
        {
          fetchFn: async () => {
            throw new Error('fetch should not run')
          },
          readConfig: () => ({
            apiToken: 'test-token',
            tagId: '97247724'
          }),
          resolveToken: () => undefined
        }
      ),
    (error: unknown) =>
      error instanceof MicrosoftUetCapiConfigError
      && error.reason === 'missing_msclkid'
  )
})

test('fails closed without CAPI token', async () => {
  await assert.rejects(
    () =>
      sendMicrosoftUetCapiBeginCheckout(beginCheckout(), {
        fetchFn: async () => {
          throw new Error('fetch should not run')
        },
        readConfig: () => ({ tagId: '97247724' }),
        resolveToken: () => undefined
      }),
    (error: unknown) =>
      error instanceof MicrosoftUetCapiConfigError
      && error.reason === 'missing_capi_token'
  )
})

test('surfaces non-2xx Microsoft responses as HTTP errors', async () => {
  await assert.rejects(
    () =>
      sendMicrosoftUetCapiBeginCheckout(beginCheckout(), {
        fetchFn: async () => ({
          headers: new Headers(),
          ok: false,
          status: 401,
          text: async () => '{"error":{"code":"Unauthorized"}}'
        }),
        readConfig: () => ({
          apiToken: 'bad-token',
          tagId: '97247724'
        }),
        resolveToken: () => 'bad-token'
      }),
    (error: unknown) =>
      error instanceof MicrosoftUetCapiHttpError
      && error.status === 401
  )
})
