import type { ProcessRefundResult } from './processRefundWithDependencies'

export function createRefundWebhookAcknowledgement(
  result: ProcessRefundResult
): Response {
  return Response.json(result, { status: 202 })
}
