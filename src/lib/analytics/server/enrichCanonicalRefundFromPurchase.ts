import {
  canonicalPurchaseSchema,
  type CanonicalPurchase
} from '../purchaseEvent'
import {
  canonicalRefundSchema,
  type CanonicalRefund
} from '../refundEvent'
import { assertCanonicalPurchaseIdentity } from './assertCanonicalPurchaseIdentity'

export function enrichCanonicalRefundFromPurchase(
  refund: CanonicalRefund,
  purchaseInput: CanonicalPurchase
) {
  const purchase = canonicalPurchaseSchema.parse(purchaseInput)
  assertCanonicalPurchaseIdentity(purchase)

  if (
    refund.custom_data.transaction_id !==
    purchase.custom_data.transaction_id
  ) {
    throw new Error('canonical_refund_purchase_link_mismatch')
  }

  return canonicalRefundSchema.parse({
    ...refund,
    consent: purchase.consent,
    ...(purchase.browser_id ?
      { browser_id: purchase.browser_id }
    : {}),
    ...(purchase.click_id ?
      { click_id: purchase.click_id }
    : {}),
    ...(purchase.external_id ?
      { external_id: purchase.external_id }
    : {}),
    ...(purchase.impression_id ?
      { impression_id: purchase.impression_id }
    : {}),
    ...(purchase.user_data ?
      { user_data: purchase.user_data }
    : {}),
    ...(purchase.client_ip_address ?
      { client_ip_address: purchase.client_ip_address }
    : {}),
    ...(purchase.event_device_info ?
      { event_device_info: purchase.event_device_info }
    : {}),
    ...(purchase.location ?
      { location: purchase.location }
    : {}),
    ...(purchase.region_code ?
      { region_code: purchase.region_code }
    : {}),
    ...(purchase.page_url ?
      { page_url: purchase.page_url }
    : {}),
    ...(purchase.referrer_url ?
      { referrer_url: purchase.referrer_url }
    : {}),
    ...(purchase.signal_audit ?
      { signal_audit: purchase.signal_audit }
    : {})
  })
}
