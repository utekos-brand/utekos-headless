// Path: src/lib/helpers/normalizers/normalizeCart.ts

import type { Cart, CartLine, CartResponse } from 'types/cart'
import { normalizeProductImage } from './normalizeProductImage'

type ShopifyCartLineEdge = CartResponse['lines']['edges'][number]

const normalizeCartLine = ({ node }: ShopifyCartLineEdge): CartLine => ({
  id: node.id,
  quantity: node.quantity,
  cost: node.cost,
  merchandise: {
    ...node.merchandise,
    product: {
      ...node.merchandise.product,
      featuredImage: normalizeProductImage(
        node.merchandise.product.featuredImage,
        node.merchandise.product.title
      )
    }
  }
})

export const normalizeCart = (shopifyCart: CartResponse): Cart => {
  return {
    id: shopifyCart.id,
    checkoutUrl: shopifyCart.checkoutUrl,
    totalQuantity: shopifyCart.totalQuantity,
    cost: {
      totalAmount: shopifyCart.cost.totalAmount,
      subtotalAmount: shopifyCart.cost.subtotalAmount
    },
    lines: shopifyCart.lines.edges.map(normalizeCartLine)
  }
}
