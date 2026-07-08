import 'server-only'

import { sendMicrosoftUetPurchase } from '@/lib/tracking/microsoft-uet/sendMicrosoftUetPurchase'
import { microsoftUetQueuedPayloadSchema } from '@/lib/tracking/warehouse/microsoftUetQueuedPayloadSchema'
import type {
  ProviderDispatchQueueItem,
  ProviderDispatchResult
} from 'types/tracking/warehouse/ProviderDispatchQueueItem'
import type { MetaEventPayload } from 'types/tracking/meta'
import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'

export async function dispatchMicrosoftUetQueuedAttempt(
  attempt: ProviderDispatchQueueItem
): Promise<ProviderDispatchResult> {
  const parsedPayload = microsoftUetQueuedPayloadSchema.safeParse(attempt.payload)

  if (!parsedPayload.success) {
    return {
      success: false,
      error: `Invalid Microsoft UET queued payload: ${parsedPayload.error.message}`,
      retryable: false
    }
  }

  const result = await sendMicrosoftUetPurchase(
    parsedPayload.data.trackingPayload as MetaEventPayload,
    parsedPayload.data.attribution as CheckoutAttribution
  )

  if (result.success) {
    return { success: true }
  }

  if (result.skipped) {
    return {
      success: false,
      error: result.reason,
      retryable: false
    }
  }

  const retryable = result.reason === 'microsoft_uet_error' || result.reason === 'network_error'

  return {
    success: false,
    error: result.error,
    retryable
  }
}
