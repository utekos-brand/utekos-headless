// Path: src/types/error.types.ts

export type ShopifyErrorDetail = {
  message: string
  locations?: { line: number; column: number }[]
  path?: (string | number)[]
  extensions?: Record<string, unknown>
}

export type GraphQLError = {
  message: string
  extensions?: {
    code?: string
    [key: string]: unknown
  }
  locations?: Array<{
    line: number
    column: number
  }>
  path?: Array<string | number>
}

export type GraphQLErrorResponse = {
  errors: GraphQLError[]
  data?: null
}

export type GraphQLSuccessResponse<T> = {
  data: T
  errors?: undefined
}
