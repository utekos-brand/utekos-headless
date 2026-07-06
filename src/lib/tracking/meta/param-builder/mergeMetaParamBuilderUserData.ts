import type { MetaEventPayload } from 'types/tracking/meta'
import type { ProcessedMetaParamBuilderRequest } from '@/lib/tracking/meta/param-builder/processMetaParamBuilderRequest'

export function mergeMetaParamBuilderUserData(
  payload: MetaEventPayload,
  processedRequest: ProcessedMetaParamBuilderRequest
): MetaEventPayload {
  return {
    ...payload,
    userData: {
      ...payload.userData,
      fbc: processedRequest.fbc ?? payload.userData?.fbc,
      fbp: processedRequest.fbp ?? payload.userData?.fbp,
      client_ip_address: processedRequest.clientIp ?? payload.userData?.client_ip_address
    }
  }
}
