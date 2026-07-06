// Path: src/lib/errors/extractCartErrorMessage.ts

import { extractErrorMessage } from './extractErrorMessage'

export const extractCartErrorMessage = (thrown: unknown): string => {
  const baseMessage = extractErrorMessage(thrown)
  if (baseMessage === 'En uventet feil oppstod') {
    return 'En uventet feil oppstod under behandling av handlekurven'
  }

  return baseMessage
}
