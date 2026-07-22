import {
  deterministicRefundEventId,
  type CanonicalRefund
} from '../refundEvent'

const SHOPIFY_ORDER_TRANSACTION_PREFIX = 'shopify_order_'
const SHOPIFY_REFUND_RECORD_PREFIX = 'shopify_refund_'

export function readCanonicalRefundShopifyIdentity(
  event: CanonicalRefund
) {
  const transactionId = event.custom_data.transaction_id
  const refundId = event.custom_data.refund_id
  const orderLegacyId =
    transactionId.startsWith(SHOPIFY_ORDER_TRANSACTION_PREFIX) ?
      transactionId.slice(
        SHOPIFY_ORDER_TRANSACTION_PREFIX.length
      )
    : ''
  const refundLegacyId =
    refundId.startsWith(SHOPIFY_REFUND_RECORD_PREFIX) ?
      refundId.slice(SHOPIFY_REFUND_RECORD_PREFIX.length)
    : ''

  if (
    !/^[1-9]\d*$/.test(orderLegacyId) ||
    !/^[1-9]\d*$/.test(refundLegacyId) ||
    event.event_id !== deterministicRefundEventId(refundLegacyId)
  ) {
    throw new Error('canonical_refund_identity_mismatch')
  }

  return { orderLegacyId, refundLegacyId }
}

export function assertCanonicalRefundIdentity(
  event: CanonicalRefund
) {
  readCanonicalRefundShopifyIdentity(event)
}
