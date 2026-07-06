// Path: api/graphql/mutations/cart.ts
import cart from '@/lib/fragments/cartFragment'

export const mutationCartCreate = /* GraphQL */ `
  mutation cartCreate(
    $lines: [CartLineInput!]
    $attributes: [AttributeInput!]
  ) {
    cartCreate(input: { lines: $lines, attributes: $attributes }) {
      cart {
        ...cart
      }
    }
  }
  ${cart}
`

export const mutationCartLinesAdd = /* GraphQL */ `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${cart}
`
export const mutationCartLinesRemove = /* GraphQL */ `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cart
      }
    }
  }
  ${cart}
`
export const mutationCartLinesUpdate = /* GraphQL */ `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
    }
  }
  ${cart}
`
export const mutationCartDiscountCodesUpdate = /* GraphQL */ `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...cart
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cart}
`
