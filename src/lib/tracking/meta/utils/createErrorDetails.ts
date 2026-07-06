import type { MetaCatalogSyncErrorDetails } from '../metaCatalogTypes'

export function createErrorDetails(error: unknown): MetaCatalogSyncErrorDetails {
  const metaError = error as {
    message?: string
    response?: {
      error?: {
        code?: number | string
        type?: string
        fbtrace_id?: string
        error_subcode?: number | string
        message?: string
      }
    }
  }

  const responseError = metaError.response?.error
  const errorDetails: MetaCatalogSyncErrorDetails = {
    message: responseError?.message || metaError.message || 'Meta catalog sync failed',
    raw: error
  }

  const errorCode = responseError?.code ?? responseError?.error_subcode
  if (errorCode !== undefined) {
    errorDetails.code = errorCode
  }

  if (responseError?.type) {
    errorDetails.type = responseError.type
  }

  if (responseError?.fbtrace_id) {
    errorDetails.fbtraceId = responseError.fbtrace_id
  }

  return errorDetails
}
