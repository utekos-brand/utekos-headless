import type { CanonicalSelectItemCustomData } from './selectItemEvent'
import { mapShopifyViewItem } from './shopifyViewItemCommerce'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

export type MapShopifySelectItemInput = {
  destinationUrl?: string
  interactionId: string
  itemListId: string
  product: ShopifyProduct
  quantity?: number
  variant: ShopifyProductVariant
}

export function mapShopifySelectItem(
  input: MapShopifySelectItemInput
): CanonicalSelectItemCustomData {
  const commerce = mapShopifyViewItem({
    product: input.product,
    variant: input.variant,
    quantity: input.quantity ?? 1
  })

  return {
    interaction_id: input.interactionId,
    item_list_id: input.itemListId,
    ...(input.destinationUrl ?
      { destination_url: input.destinationUrl }
    : {}),
    currency: commerce.currency,
    value: commerce.value,
    gross_value: commerce.gross_value,
    tax_value: commerce.tax_value,
    items: commerce.items
  }
}
