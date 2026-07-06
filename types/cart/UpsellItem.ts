// Path: types/cart/UpsellItem.ts

import type { ShopifyProduct } from 'types/product/ShopifyProduct'

export interface UpsellItemProps {
  product: ShopifyProduct
  showDiscountHint?: boolean
}
