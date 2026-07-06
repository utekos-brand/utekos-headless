import type {
  KlarnaCollectedShippingAddress,
  KlarnaExpressOrderPayload
} from '@/components/klarna/schemas/klarnaExpressOrderSchema'

export function applyShippingAddressToOrderPayload(
  orderPayload: KlarnaExpressOrderPayload,
  collectedShippingAddress: KlarnaCollectedShippingAddress
): KlarnaExpressOrderPayload & {
  billing_address: KlarnaCollectedShippingAddress
  shipping_address: KlarnaCollectedShippingAddress
} {
  const country =
    collectedShippingAddress.country?.toUpperCase() ||
    orderPayload.purchase_country.toUpperCase()

  const normalizedAddress: KlarnaCollectedShippingAddress = {
    ...collectedShippingAddress,
    country
  }

  return {
    ...orderPayload,
    billing_address: normalizedAddress,
    shipping_address: normalizedAddress
  }
}
