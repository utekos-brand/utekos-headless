import { z } from 'zod'

const metaApiErrorSchema = z
  .object({
    code: z.number().int().optional(),
    error_subcode: z.number().int().optional(),
    message: z.string().optional(),
    type: z.string().optional()
  })
  .passthrough()

const errorEnvelopeSchema = z
  .object({
    message: z.string().optional(),
    response: z.unknown().optional(),
    status: z.number().int().optional()
  })
  .passthrough()

const responseEnvelopeSchema = z
  .object({
    data: z.unknown().optional(),
    error: z.unknown().optional()
  })
  .passthrough()

export type MetaApiErrorDetails = {
  code?: number | undefined
  errorSubcode?: number | undefined
  message: string
  retryable: boolean
  status?: number | undefined
  type?: string | undefined
}

function parseMetaApiError(value: unknown) {
  const directResult = metaApiErrorSchema.safeParse(value)

  if (directResult.success && directResult.data.code !== undefined) {
    return directResult.data
  }

  const envelopeResult = responseEnvelopeSchema.safeParse(value)

  if (!envelopeResult.success) {
    return directResult.success ? directResult.data : undefined
  }

  const errorResult = metaApiErrorSchema.safeParse(envelopeResult.data.error)

  if (errorResult.success) {
    return errorResult.data
  }

  const dataResult = responseEnvelopeSchema.safeParse(envelopeResult.data.data)
  const dataErrorResult = metaApiErrorSchema.safeParse(
    dataResult.success ? dataResult.data.error : undefined
  )

  return dataErrorResult.success
    ? dataErrorResult.data
    : directResult.success
      ? directResult.data
      : undefined
}

export function getMetaApiErrorDetails(error: unknown): MetaApiErrorDetails {
  const envelopeResult = errorEnvelopeSchema.safeParse(error)
  const apiError = parseMetaApiError(envelopeResult.success ? envelopeResult.data.response : error)
  const message = apiError?.message ?? (envelopeResult.success ? envelopeResult.data.message : undefined)
  const normalizedMessage = message ?? 'Unknown Meta API error'
  const isExpiredTokenMessage =
    normalizedMessage.toLowerCase().includes('token has expired')
    || normalizedMessage.toLowerCase().includes('invalid oauth')
  const isDispatchDisabled = normalizedMessage.toLowerCase().includes('meta capi dispatch disabled')

  return {
    code: apiError?.code,
    errorSubcode: apiError?.error_subcode,
    message: normalizedMessage,
    retryable: apiError?.code !== 190 && !isExpiredTokenMessage && !isDispatchDisabled,
    status: envelopeResult.success ? envelopeResult.data.status : undefined,
    type: apiError?.type
  }
}
