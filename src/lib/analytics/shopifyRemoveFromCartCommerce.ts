import { createCartMutationId } from './shopifyAddToCartCommerce'
import { mapShopifyViewItem, UTEKOS_NORWAY_PRICE_CONTEXT } from './shopifyViewItemCommerce'
import type { CanonicalRemoveFromCartCustomData } from './removeFromCartEvent'
import type { CartProductVariant } from 'types/cart/CartProductVariant'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

export type MapShopifyRemoveFromCartInput = {
  cartId: string
  mutationTimestamp: string
  product: ShopifyProduct
  quantity: number
  variant: CartProductVariant
}

function cartVariantToShopifyVariant(
  merchandise: CartProductVariant
): ShopifyProductVariant {
  return {
    id: merchandise.id,
    title: merchandise.title,
    barcode: null,
    availableForSale: merchandise.availableForSale,
    currentlyNotInStock: !merchandise.availableForSale,
    taxable: true,
    selectedOptions: merchandise.selectedOptions,
    price: merchandise.price,
    image: merchandise.image,
    compareAtPrice: merchandise.compareAtPrice,
    product: merchandise.product as ShopifyProduct,
    metafield: null,
    sku: undefined,
    variantProfile: null,
    weight: null,
    weightUnit: 'GRAMS',
    quantityAvailable: null
  }
}

export function mapShopifyRemoveFromCart(
  input: MapShopifyRemoveFromCartInput
): CanonicalRemoveFromCartCustomData {
  const commerce = mapShopifyViewItem({
    product: input.product,
    variant: cartVariantToShopifyVariant(input.variant),
    quantity: input.quantity,
    priceContext: UTEKOS_NORWAY_PRICE_CONTEXT
  })

  return {
    ...commerce,
    cart_id: input.cartId,
    cart_mutation_id: createCartMutationId({
      cartId: input.cartId,
      mutationTimestamp: input.mutationTimestamp,
      quantity: input.quantity,
      variantId: input.variant.id
    })
  }
}
