import assert from 'node:assert/strict'
import test from 'node:test'

import type { OrderPaid } from 'types/commerce/order/OrderPaid'
import type { ProviderDispatchAttemptInput } from 'types/tracking/event'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import { processOrderTrackingWithDependencies } from './processOrderTrackingWithDependencies'

function createOrder(): OrderPaid {
  return {
    id: 123456789,
    name: '#1001',
    order_number: 1001,
    order_status_url: 'https://kasse.utekos.no/orders/123456789',
    created_at: '2026-06-14T10:00:00.000Z',
    processed_at: '2026-06-14T10:05:00.000Z',
    total_price: '5980.00',
    currency: 'NOK',
    total_tax: '1196.00',
    total_shipping_price_set: {
      shop_money: {
        amount: '99.00',
        currency_code: 'NOK'
      }
    },
    discount_codes: [],
    note_attributes: [],
    line_items: [
      {
        sku: 'SKU-UTEKOS-DUN-L',
        variant_id: 456,
        product_id: 789,
        title: 'Utekos dun',
        name: 'Utekos dun - Large',
        quantity: 2,
        price: '2990.00',
        vendor: 'Utekos',
        variant_title: 'Large'
      }
    ],
    customer: {
      id: 999,
      email: 'kunde@example.com'
    },
    billing_address: null,
    shipping_address: null,
    client_details: null,
    browser_ip: null,
    cart_token: 'cart-token',
    checkout_token: 'checkout-token'
  } as unknown as OrderPaid
}

test('persists a full purchase payload and dispatches Google when GA client id exists', async () => {
  const attribution: CheckoutAttribution = {
    cartId: 'cart-token',
    checkoutUrl: 'https://kasse.utekos.no/checkouts/checkout-token',
    userData: {},
    ga_client_id: '1234567890.987654321',
    ga_session_id: '1749895200',
    msclkid: 'dd4afcccb1c9a4cad9544dd7e5006',
    ts: Date.now()
  }
  const persisted: Array<{ payload: unknown; providers: readonly string[] }> = []
  const googleDispatches: unknown[] = []
  const microsoftDispatches: unknown[] = []
  const providerAudits: ProviderDispatchAttemptInput[] = []

  const result = await processOrderTrackingWithDependencies(createOrder(), {
    getRedisAttribution: async () => attribution,
    persistAcceptedTrackingEvent: async (payload, _consent, providers) => {
      persisted.push({ payload, providers })
    },
    sendGooglePurchase: async context => {
      googleDispatches.push(context)
      return {
        success: true,
        orderId: context.order.id,
        requestId: 'ga-request',
        transactionId: '123456789',
        value: 5980,
        currency: 'NOK',
        itemCount: 1,
        transport: 'direct_ga4'
      }
    },
    sendMicrosoftUetPurchase: async (payload, checkoutAttribution) => {
      microsoftDispatches.push({ payload, checkoutAttribution })
      return {
        success: true,
        tagId: '97247724',
        status: 200,
        eventId: payload.eventId ?? 'missing',
        eventName: 'purchase',
        itemCount: 1,
        value: 5980,
        currency: 'NOK'
      }
    },
    recordProviderDispatchAttempt: async input => {
      providerAudits.push(input)
    },
    logger: async () => {}
  })

  assert.equal(result.success, true)
  assert.equal(persisted.length, 1)
  assert.equal(googleDispatches.length, 1)
  assert.equal(microsoftDispatches.length, 1)
  assert.deepEqual(providerAudits.map(item => ({
    provider: item.provider,
    success: item.success,
    skipped: item.skipped,
    dispatchMode: item.dispatchMode
  })), [
    { provider: 'google', success: true, skipped: false, dispatchMode: 'server_direct' },
    { provider: 'microsoft_uet', success: true, skipped: false, dispatchMode: 'server_direct' }
  ])
  assert.deepEqual(persisted[0]?.providers, [])
  assert.equal((persisted[0]?.payload as { eventData?: { transaction_id?: string } }).eventData?.transaction_id, '123456789')
  assert.deepEqual(result.details, {
    orderId: 123456789,
    googleOk: true,
    googleSkippedReason: undefined,
    microsoftOk: true,
    microsoftSkippedReason: undefined,
    ledgerOk: true,
    attributionFound: true,
    hasGoogleClientId: true,
    cartToken: 'present',
    checkoutToken: 'present'
  })
})

test('persists purchase payload and logs skip when GA client id is missing', async () => {
  const logs: Array<{ level: string; message: string; meta?: Record<string, unknown> }> = []
  const persisted: unknown[] = []
  const providerAudits: ProviderDispatchAttemptInput[] = []

  const result = await processOrderTrackingWithDependencies(createOrder(), {
    getRedisAttribution: async () => null,
    persistAcceptedTrackingEvent: async payload => {
      persisted.push(payload)
    },
    sendGooglePurchase: async () => {
      throw new Error('Google dispatch should not run without GA client id')
    },
    recordProviderDispatchAttempt: async input => {
      providerAudits.push(input)
    },
    logger: async (level, message, meta) => {
      logs.push({
        level,
        message,
        ...(meta ? { meta } : {})
      })
    }
  })

  assert.equal(result.success, true)
  assert.equal(persisted.length, 1)
  assert.deepEqual(providerAudits.map(item => ({
    provider: item.provider,
    success: item.success,
    skipped: item.skipped,
    skipReason: item.skipReason,
    dispatchMode: item.dispatchMode
  })), [
    {
      provider: 'google',
      success: false,
      skipped: true,
      skipReason: 'missing_client_id',
      dispatchMode: 'server_direct'
    },
    {
      provider: 'microsoft_uet',
      success: false,
      skipped: true,
      skipReason: 'not_configured',
      dispatchMode: 'server_direct'
    }
  ])
  assert.equal(logs.some(log => log.level === 'WARN' && log.message === 'GA4 Purchase Skipped'), true)
  assert.deepEqual(result.details, {
    orderId: 123456789,
    googleOk: false,
    googleSkippedReason: 'missing_client_id',
    microsoftOk: false,
    microsoftSkippedReason: 'not_configured',
    ledgerOk: true,
    attributionFound: false,
    hasGoogleClientId: false,
    cartToken: 'present',
    checkoutToken: 'present'
  })
})
