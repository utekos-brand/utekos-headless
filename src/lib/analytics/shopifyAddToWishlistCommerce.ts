import type { CanonicalAddToWishlistCustomData } from './addToWishlistEvent'
import { mapShopifyViewItem } from './shopifyViewItemCommerce'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

export type MapShopifyAddToWishlistInput = {
  product: ShopifyProduct
  quantity?: number
  variant: ShopifyProductVariant
  wishlistMutationId: string
}

/**
 * Overview/list payloads sometimes omit `taxable`. Norway storefront defaults
 * to taxable so Meta/Google commerce values stay consistent with view_item.
 */
function withTaxableDefault(
  variant: ShopifyProductVariant
): ShopifyProductVariant {
  if (typeof variant.taxable === 'boolean') return variant
  return { ...variant, taxable: true }
}

export function mapShopifyAddToWishlist(
  input: MapShopifyAddToWishlistInput
): CanonicalAddToWishlistCustomData {
  const commerce = mapShopifyViewItem({
    product: input.product,
    variant: withTaxableDefault(input.variant),
    quantity: input.quantity ?? 1
  })

  return {
    wishlist_mutation_id: input.wishlistMutationId,
    currency: commerce.currency,
    value: commerce.value,
    gross_value: commerce.gross_value,
    tax_value: commerce.tax_value,
    items: commerce.items
  }
}
