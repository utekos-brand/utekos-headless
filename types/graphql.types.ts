// Path: types/graphql.types.ts

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
