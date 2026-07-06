// Path: types/tracking/meta/MetaErrorResponseData.ts

export type MetaErrorResponseData = {
  error?: {
    message?: string
    type?: string
    code?: number
  }
  [key: string]: unknown
}
