import assert from 'node:assert/strict'
import test from 'node:test'
import {
  deterministicRefundEventId,
  shopifyRefundRecordId
} from '../refundEvent'
import { shopifyPurchaseTransactionId } from '../purchaseEvent'
import { shopifyGraphqlRefundToCanonicalRefund } from './shopifyGraphqlRefundToCanonicalRefund'
import type {
  ShopifyCommerceReconciliationOrder,
  ShopifyCommerceReconciliationRefund
} from './shopifyCommerceReconciliationGraphqlSchema'

function money(amount: string, currencyCode = 'NOK') {
  return {
    shopMoney: { amount, currencyCode },
    presentmentMoney: { amount, currencyCode }
  }
}

function order(): ShopifyCommerceReconciliationOrder {
  return {
    id: 'gid://shopify/Order/555',
    legacyResourceId: '555',
    name: '#1555',
    createdAt: '2026-07-01T10:00:00Z',
    processedAt: '2026-07-01T10:01:00Z',
    updatedAt: '2026-07-01T12:00:00Z',
    displayFinancialStatus: 'PAID',
    currencyCode: 'NOK',
    presentmentCurrencyCode: 'NOK',
    taxesIncluded: false,
    email: null,
    phone: null,
    clientIp: null,
    statusPageUrl: null,
    customAttributes: [],
    totalPriceSet: money('250.00'),
    totalTaxSet: money('0.00'),
    totalShippingPriceSet: money('0.00'),
    discountCodes: [],
    discountApplications: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: []
    },
    shippingAddress: null,
    billingAddress: null,
    customer: null,
    customerJourneySummary: null,
    lineItems: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: []
    },
    refunds: []
  }
}

function refund(
  overrides: Partial<ShopifyCommerceReconciliationRefund> = {}
): ShopifyCommerceReconciliationRefund {
  return {
    id: 'gid://shopify/Refund/900',
    legacyResourceId: '900',
    createdAt: '2026-07-01T12:00:00Z',
    updatedAt: '2026-07-01T12:00:00Z',
    totalRefundedSet: money('50.00'),
    refundLineItems: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: [
        {
          id: 'gid://shopify/RefundLineItem/1',
          quantity: 1,
          subtotalSet: money('50.00'),
          lineItem: {
            id: 'gid://shopify/LineItem/10',
            name: 'Pants',
            title: 'Pants',
            sku: 'PNT-1',
            variant: {
              id: 'gid://shopify/ProductVariant/88',
              legacyResourceId: '88'
            },
            originalUnitPriceSet: money('250.00')
          }
        }
      ]
    },
    transactions: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: [
        {
          id: 'gid://shopify/OrderTransaction/1',
          amountSet: money('50.00'),
          status: 'SUCCESS',
          kind: 'REFUND',
          gateway: 'shopify_payments',
          createdAt: '2026-07-01T12:00:00Z',
          order: { legacyResourceId: '555' }
        }
      ]
    },
    ...overrides
  }
}

test('shopifyGraphqlRefundToCanonicalRefund uses deterministic ids and server source', () => {
  const event = shopifyGraphqlRefundToCanonicalRefund({
    order: order(),
    refund: refund()
  })

  assert.equal(event.source, 'server')
  assert.equal(event.event_id, deterministicRefundEventId('900'))
  assert.equal(
    event.custom_data.refund_id,
    shopifyRefundRecordId('900')
  )
  assert.equal(
    event.custom_data.transaction_id,
    shopifyPurchaseTransactionId('555')
  )
  assert.equal(event.custom_data.value, 50)
  assert.equal(event.custom_data.currency, 'NOK')
  assert.equal(event.custom_data.items[0]?.item_id, '88')
  assert.equal(event.consent.marketing, 'denied')
})

test('shopifyGraphqlRefundToCanonicalRefund fails closed without transaction currency', () => {
  assert.throws(
    () =>
      shopifyGraphqlRefundToCanonicalRefund({
        order: order(),
        refund: refund({
          transactions: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: []
          },
          refundLineItems: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: []
          }
        })
      }),
    /transaction currency/
  )
})

test('shopifyGraphqlRefundToCanonicalRefund fails closed without an item name', () => {
  const refundWithoutItemName = refund()
  refundWithoutItemName.refundLineItems.nodes[0]!.lineItem = {
    ...refundWithoutItemName.refundLineItems.nodes[0]!.lineItem,
    name: null,
    title: null
  }

  assert.throws(
    () =>
      shopifyGraphqlRefundToCanonicalRefund({
        order: order(),
        refund: refundWithoutItemName
      }),
    /requires a name/
  )
})
