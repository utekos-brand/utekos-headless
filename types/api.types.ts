// Path: types/api.types.ts

import type { Cart, CartResponse, ShopifyCart } from 'types/cart'
import type { GraphQLErrorResponse } from './graphql.types'
import type { DehydratedState } from '@tanstack/react-query'
import type { ShopifyProduct } from 'types/product'

export interface ProvidersProps {
  children: React.ReactNode
  cartId: string | null
  initialCart: Cart | null
  dehydratedState: DehydratedState
  recommendedProducts: ShopifyProduct[]
  accessoryProducts: ShopifyProduct[]
}
export type ShopifyOperation<TData, TVariables = never> = {
  data: TData
  variables: TVariables
}
export type ShopifyResponse<T> =
  | { success: true; status: number; body: T }
  | { success: false; status: number; error: string }

export type ShopifyFetchResult<TData> =
  | { success: true; body: TData }
  | { success: false; error: GraphQLErrorResponse }

export type Connection<T> = {
  edges: Array<Edge<T>>
}

export type Edge<T> = {
  node: T
}

export type ShopifyErrorDetail = {
  message: string
  locations?: { line: number; column: number }[]
  path?: (string | number)[]
  extensions?: Record<string, unknown>
}

export type ShopifyCartOperation = ShopifyOperation<
  { cart: ShopifyCart },
  { cartId: string }
>
export type ShopifyDiscountCodesUpdateOperation = ShopifyOperation<
  {
    cartDiscountCodesUpdate: {
      cart: ShopifyCart
      userErrors?: {
        field: string
        message: string
      }[]
    }
  },
  {
    cartId: string
    discountCodes: string[]
  }
>

export type ShopifyAddToCartOperation = ShopifyOperation<
  { cartLinesAdd: { cart: ShopifyCart } },
  {
    cartId: string
    lines: { merchandiseId: string; quantity: number }[]
  }
>

export type ShopifyCreateCartOperation = ShopifyOperation<
  { cartCreate: { cart: CartResponse } },
  {
    lines: { merchandiseId: string; quantity: number }[]
    attributes?: { key: string; value: string }[]
  }
>

export type ShopifyRemoveFromCartOperation = ShopifyOperation<
  { cartLinesRemove: { cart: ShopifyCart } },
  { cartId: string; lineIds: string[] }
>

export type ShopifyUpdateCartLineQuantityOperation = ShopifyOperation<
  { cartLinesUpdate: { cart: ShopifyCart } },
  {
    cartId: string
    lines: { id: string; quantity: number }[]
  }
>

/**
 * Defines the shape of the input for the error detail factory.
 * The types now explicitly include `| undefined` to match Zod's `.optional()`
 * output and satisfy the `exactOptionalPropertyTypes` compiler option.
 */
export type ShopifyErrorDetailInput = {
  message: string
  locations?: { line: number; column: number }[] | undefined
  path?: (string | number)[] | undefined
  extensions?: Record<string, unknown> | undefined
}

export type ShopifyProductOperation = ShopifyOperation<
  { product: ShopifyProduct },
  { handle: string }
>

export type ShopifyProductsOperation = ShopifyOperation<
  { products: Connection<ShopifyProduct> },
  { query?: string; reverse?: boolean; sortKey?: string }
>

export type GetProductsParams = {
  query?: string
  reverse?: boolean
  sortKey?: string
  first?: number
}

export type GetProductsResponse = {
  success: boolean
  status: number
  body?: ShopifyProduct[]
  error?: string
}

export type ExtractVariables<T> =
  T extends { variables: object } ? T['variables'] : never
