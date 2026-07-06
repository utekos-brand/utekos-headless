// Path: types/cart/CartProductVariant.ts

import type { Image } from 'types/media'
import type { Money } from 'types/commerce/Money'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'

export type CartProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  image: Image | null
  compareAtPrice: Money | null
  selectedOptions: { name: string; value: string }[]
  product: Omit<ShopifyProduct, 'featuredImage'> & {
    featuredImage: Image
  }
}
