import type { ResponseErrors } from '@shopify/graphql-client'

export function isShopifyErrorResponse(
  error: unknown
): error is ResponseErrors {
  return (
    typeof error === 'object'
    && error !== null
    && ('graphQLErrors' in error || 'networkStatusCode' in error)
  )
}
