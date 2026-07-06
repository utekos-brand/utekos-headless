import type { QueryParams } from 'capi-param-builder-nodejs'
import type { NextRequest } from 'next/server'

export function getRequestQueryObject(request: NextRequest): QueryParams {
  const query: QueryParams = {}

  request.nextUrl.searchParams.forEach((value, key) => {
    query[key] = value
  })

  return query
}
