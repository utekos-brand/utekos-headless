import 'server-only'

import { sendGA4BrowserEvent } from '@/lib/tracking/google/sendGA4BrowserEvent'
import { getMetaApiErrorDetails } from '@/lib/tracking/meta/getMetaApiErrorDetails'
import { sendMetaBrowserEvent } from '@/lib/tracking/meta/sendMetaBrowserEvent'
import { prepareEventContext } from '@/lib/tracking/services/prepareEventContext'
import { trackingEventPayloadSchema } from '@/lib/tracking/utils/trackingEventPayloadSchema'
import type {
  ProviderDispatchQueueItem,
  ProviderDispatchResult
} from 'types/tracking/warehouse/ProviderDispatchQueueItem'
import type { MetaEventPayload } from 'types/tracking/meta'

export async function dispatchClaimedProviderAttempt(
  attempt: ProviderDispatchQueueItem
): Promise<ProviderDispatchResult> {
  const parsedPayload = trackingEventPayloadSchema.safeParse(attempt.payload)

  if (!parsedPayload.success) {
    return {
      success: false,
      error: `Invalid queued tracking payload: ${parsedPayload.error.message}`
    }
  }

  const payload = parsedPayload.data as MetaEventPayload
  const clientIp = payload.userData?.client_ip_address ?? ''
  const userAgent = payload.userData?.client_user_agent ?? ''

  try {
    if (attempt.provider === 'meta') {
      const { userData } = prepareEventContext(payload, {}, clientIp, userAgent)

      try {
        await sendMetaBrowserEvent(payload, userData)
        return { success: true }
      } catch (error) {
        const details = getMetaApiErrorDetails(error)

        return {
          success: false,
          error: details.message,
          retryable: details.retryable
        }
      }
    }

    const result = await sendGA4BrowserEvent(payload, { clientIp, userAgent })

    return result.success
      ? { success: true }
      : { success: false, error: result.error }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown provider dispatch error'
    }
  }
}
