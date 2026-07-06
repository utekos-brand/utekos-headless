// Path: src/api/graphql/response/isGraphQLSuccessResponse.ts

import type { GraphQLSuccessResponse } from '@types'

export function isGraphQLSuccessResponse<T>(
  response: unknown
): response is GraphQLSuccessResponse<T> {
  return (
    typeof response === 'object'
    && response !== null
    && 'data' in response
    && !(
      'errors' in response
      && Array.isArray((response as { errors?: unknown }).errors)
      && ((response as { errors?: unknown[] }).errors?.length ?? 0) > 0
    )
  )
}
