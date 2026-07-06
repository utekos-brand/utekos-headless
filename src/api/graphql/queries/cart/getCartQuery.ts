// Path: src/api/graphql/queries/cart/getCartQuery.ts

import cartFragment from '@/lib/fragments/cartFragment'
export const getCartQuery = `
query getCart($cartId: ID!) {
    cart(id: $cartId) {
        ...cart
      }
    }
  ${cartFragment}
`
