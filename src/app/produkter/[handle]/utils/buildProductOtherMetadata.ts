import type { ShopifyProduct } from 'types/product'
import type { MetadataOther } from '../types'

export function buildProductOtherMetadata(product: ShopifyProduct): MetadataOther {
  const selectedVariant = product.selectedOrFirstAvailableVariant
  const other: MetadataOther = {}

  const priceAmount = selectedVariant?.price.amount
  const currencyCode = selectedVariant?.price.currencyCode
  const retailerItemId = selectedVariant?.id
  const itemGroupId = product.id

  const isOutOfStock =
    selectedVariant?.availableForSale === false
    || selectedVariant?.currentlyNotInStock === true
    || product.availableForSale === false

  if (retailerItemId) {
    other['product:retailer_item_id'] = retailerItemId
  }

  if (itemGroupId) {
    other['product:item_group_id'] = itemGroupId
  }

  if (priceAmount != null) {
    other['product:price:amount'] = String(priceAmount)
  }

  if (currencyCode) {
    other['product:price:currency'] = currencyCode
  }

  if (selectedVariant?.compareAtPrice?.amount != null) {
    other['product:variant:compare_at_price'] = String(selectedVariant.compareAtPrice.amount)
  }

  other['product:availability'] = isOutOfStock ? 'out of stock' : 'in stock'
  other['product:condition'] = 'new'

  return other
}
