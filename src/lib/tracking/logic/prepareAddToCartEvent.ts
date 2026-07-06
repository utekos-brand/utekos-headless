import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import type { MetaContentItem } from 'types/tracking/meta'
import type { AddToCartEventData, PrepareAddToCartInput } from 'types/cart/AddToCart'

export function prepareAddToCartEvent(input: PrepareAddToCartInput): AddToCartEventData {
  const { product, selectedVariant, quantity, additionalLine } = input

  const basePrice = Number.parseFloat(selectedVariant.price.amount)
  const currency = selectedVariant.price.currencyCode
  let totalQty = quantity

  const mainVariantId = cleanShopifyId(selectedVariant.id) || selectedVariant.id.toString()
  const eventID = `atc_${cleanShopifyId(selectedVariant.id)}_${Date.now()}`

  const contents: MetaContentItem[] = [
    {
      id: mainVariantId,
      quantity: quantity,
      item_price: basePrice
    }
  ]
  const contentIds: string[] = [mainVariantId]
  let contentName = product.title

  if (additionalLine) {
    const additionalVariantId = cleanShopifyId(additionalLine.variantId) || additionalLine.variantId

    contents.push({
      id: additionalVariantId,
      quantity: additionalLine.quantity,
      item_price: 0
    })
    contentIds.push(additionalVariantId)
    totalQty += additionalLine.quantity
  }

  const value = basePrice * quantity

  return {
    eventID,
    contentName,
    contentIds,
    contents,
    value,
    currency,
    totalQty,
    mainVariantId
  }
}
