// Path: src/api/graphql/response/isGraphQLErrorResponse.ts

import type { GraphQLErrorResponse } from '@types'
export function isGraphQLErrorResponse(
  response: unknown
): response is GraphQLErrorResponse {
  return (
    typeof response === 'object'
    && response !== null
    && 'errors' in response
    && Array.isArray((response as { errors: unknown }).errors)
    && (response as { errors: unknown[] }).errors.length > 0
  )
}
