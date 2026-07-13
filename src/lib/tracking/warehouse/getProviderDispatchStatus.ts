type ProviderDispatchStatusInput = {
  success: boolean
  skipped?: boolean
  retryable?: boolean
  dispatchMode?: 'server_retry' | 'server_direct' | 'client_observed'
  verification?: 'provider_confirmed' | 'transport_accepted'
}

export type ProviderDispatchStatus =
  | 'succeeded'
  | 'accepted_unverified'
  | 'skipped_unqualified'
  | 'failed'
  | 'retry_scheduled'

export const TERMINAL_PROVIDER_DISPATCH_STATUSES = [
  'succeeded',
  'accepted_unverified',
  'failed',
  'dead_lettered',
  'skipped_unqualified'
] as const

export const NON_REQUEUEABLE_PROVIDER_DISPATCH_STATUSES = [
  'succeeded',
  'accepted_unverified',
  'skipped_unqualified'
] as const

export function isTerminalProviderDispatchStatus(status: string): boolean {
  return (TERMINAL_PROVIDER_DISPATCH_STATUSES as readonly string[]).includes(status)
}

export function canRequeueProviderDispatchStatus(status: string): boolean {
  return !(NON_REQUEUEABLE_PROVIDER_DISPATCH_STATUSES as readonly string[]).includes(status)
}

export function getProviderDispatchStatus(
  input: ProviderDispatchStatusInput
): ProviderDispatchStatus {
  const dispatchMode = input.dispatchMode ?? 'server_retry'

  if (input.skipped) {
    return 'skipped_unqualified'
  }

  if (input.success) {
    return input.verification === 'transport_accepted' ? 'accepted_unverified' : 'succeeded'
  }

  return input.retryable === false || dispatchMode !== 'server_retry' ?
      'failed'
    : 'retry_scheduled'
}
