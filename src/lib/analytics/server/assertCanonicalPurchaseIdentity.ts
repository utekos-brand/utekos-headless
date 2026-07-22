import {
  deterministicPurchaseEventId,
  type CanonicalPurchase
} from '../purchaseEvent'

const SHOPIFY_PURCHASE_TRANSACTION_PREFIX = 'shopify_order_'

export function assertCanonicalPurchaseIdentity(
  event: CanonicalPurchase
) {
  const transactionId = event.custom_data.transaction_id
  const orderLegacyId =
    (
      transactionId.startsWith(
        SHOPIFY_PURCHASE_TRANSACTION_PREFIX
      )
    ) ?
      transactionId.slice(
        SHOPIFY_PURCHASE_TRANSACTION_PREFIX.length
      )
    : ''

  if (
    !/^[1-9]\d*$/.test(orderLegacyId) ||
    event.event_id !==
      deterministicPurchaseEventId(orderLegacyId)
  ) {
    throw new Error('canonical_purchase_identity_mismatch')
  }
}
