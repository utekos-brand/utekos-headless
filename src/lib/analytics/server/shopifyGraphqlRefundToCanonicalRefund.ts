import { parseOrderConsentFromNoteAttributes } from '../checkoutConsentSnapshot'
import {
  canonicalRefundSchema,
  deterministicRefundEventId,
  shopifyRefundRecordId,
  type CanonicalRefund
} from '../refundEvent'
import { shopifyPurchaseTransactionId } from '../purchaseEvent'
import { resolveCanonicalEnvironment } from './resolveCanonicalEnvironment'
import { readShopifyGraphqlMoneyAmount } from './mapShopifyGraphqlOrderPurchasePricing'
import type {
  ShopifyCommerceReconciliationOrder,
  ShopifyCommerceReconciliationRefund
} from './shopifyCommerceReconciliationGraphqlSchema'

const deniedConsentSnapshot =
  parseOrderConsentFromNoteAttributes([])

function parseDecimal(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('invalid_refund_decimal_amount')
  }
  return value
}

function resolveRefundCurrency(
  refund: ShopifyCommerceReconciliationRefund
) {
  for (const transaction of refund.transactions.nodes) {
    const presentment =
      transaction.amountSet.presentmentMoney.currencyCode
    if (presentment) return presentment.toUpperCase()

    const shop = transaction.amountSet.shopMoney.currencyCode
    if (shop) return shop.toUpperCase()
  }

  throw new Error(
    'Shopify GraphQL refund requires a transaction currency'
  )
}

function resolveRefundValue(
  refund: ShopifyCommerceReconciliationRefund,
  currency: string
) {
  const lineItemTotal = refund.refundLineItems.nodes.reduce(
    (sum, refundLineItem) =>
      sum +
      parseDecimal(
        readShopifyGraphqlMoneyAmount(
          refundLineItem.subtotalSet,
          currency,
          'refund line item subtotal'
        )
      ),
    0
  )

  if (lineItemTotal > 0) return lineItemTotal

  return refund.transactions.nodes.reduce(
    (sum, transaction) =>
      sum +
      parseDecimal(
        readShopifyGraphqlMoneyAmount(
          transaction.amountSet,
          currency,
          'refund transaction amount'
        )
      ),
    0
  )
}

function mapRefundItems(
  refund: ShopifyCommerceReconciliationRefund,
  currency: string
) {
  return refund.refundLineItems.nodes.map(refundLineItem => {
    const lineItem = refundLineItem.lineItem
    const itemName =
      lineItem.name?.trim() || lineItem.title?.trim()

    if (!itemName) {
      throw new Error(
        'Shopify GraphQL refund line item requires a name'
      )
    }

    const itemId =
      lineItem.variant?.legacyResourceId ?
        String(lineItem.variant.legacyResourceId)
      : String(lineItem.id)
    const quantity = refundLineItem.quantity
    const subtotal = parseDecimal(
      readShopifyGraphqlMoneyAmount(
        refundLineItem.subtotalSet,
        currency,
        'refund line item subtotal'
      )
    )
    const unitPrice =
      quantity > 0 ?
        subtotal / quantity
      : readShopifyGraphqlMoneyAmount(
          lineItem.originalUnitPriceSet,
          currency,
          'refund line item unit price'
        )

    return {
      item_id: itemId,
      item_name: itemName,
      quantity,
      unit_price: unitPrice,
      ...(lineItem.sku ? { sku: lineItem.sku } : {})
    }
  })
}

export function shopifyGraphqlRefundToCanonicalRefund(input: {
  order: ShopifyCommerceReconciliationOrder
  refund: ShopifyCommerceReconciliationRefund
}): CanonicalRefund {
  const { order, refund } = input
  const refundLegacyId = String(refund.legacyResourceId)
  const orderLegacyId = String(order.legacyResourceId)
  const currency = resolveRefundCurrency(refund)
  const items = mapRefundItems(refund, currency)

  return canonicalRefundSchema.parse({
    schema_version: 1,
    event_name: 'refund',
    event_id: deterministicRefundEventId(refundLegacyId),
    event_time: refund.createdAt,
    source: 'server',
    environment: resolveCanonicalEnvironment(),
    consent: deniedConsentSnapshot,
    custom_data: {
      currency,
      value: resolveRefundValue(refund, currency),
      transaction_id:
        shopifyPurchaseTransactionId(orderLegacyId),
      refund_id: shopifyRefundRecordId(refundLegacyId),
      items
    }
  })
}
