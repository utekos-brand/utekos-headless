import type { DeadLetterProvider } from 'types/tracking/warehouse/DeadLetterEvent'
import { SERVER_RETRY_PROVIDERS } from 'types/tracking/warehouse/ProviderDispatchQueueItem'

const DEAD_LETTER_PROVIDER_PREFIX = 'tracking:'

export function parseDeadLetterProvider(source: string): DeadLetterProvider | null {
  if (!source.startsWith(DEAD_LETTER_PROVIDER_PREFIX)) {
    return null
  }

  const provider = source.slice(DEAD_LETTER_PROVIDER_PREFIX.length)

  if ((SERVER_RETRY_PROVIDERS as readonly string[]).includes(provider)) {
    return provider as DeadLetterProvider
  }

  return null
}
