import type { CheckoutAttribution } from 'types/tracking/user/CheckoutAttribution'
import type { MicrosoftUetPurchaseDispatchResult } from './sendMicrosoftUetPurchase'

export function shouldEnqueueMicrosoftUetRetry(
  result: MicrosoftUetPurchaseDispatchResult | undefined,
  settled: PromiseSettledResult<MicrosoftUetPurchaseDispatchResult | undefined>,
  attribution: CheckoutAttribution | null
): boolean {
  if (!attribution) {
    return false
  }

  if (settled.status === 'rejected') {
    return true
  }

  if (!result || result.success || result.skipped) {
    return false
  }

  return result.reason === 'microsoft_uet_error' || result.reason === 'network_error'
}
