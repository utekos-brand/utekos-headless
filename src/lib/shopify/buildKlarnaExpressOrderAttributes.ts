import {
  checkoutAttributionSnapshotToShopifyAttributes,
  type CheckoutAttributionSnapshot
} from '@/lib/analytics/checkoutAttributionSnapshot'

type BuildKlarnaExpressOrderAttributesInput = {
  attribution?: CheckoutAttributionSnapshot
  klarnaOrderId: string
}

export function buildKlarnaExpressOrderAttributes({
  attribution,
  klarnaOrderId
}: BuildKlarnaExpressOrderAttributesInput) {
  return [
    { key: 'klarna_order_id', value: klarnaOrderId },
    ...(attribution ?
      checkoutAttributionSnapshotToShopifyAttributes(attribution)
    : [])
  ]
}
