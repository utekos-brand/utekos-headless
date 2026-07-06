// Path: src/lib/errors/extractErrorMessage.ts

import { isValidationErrorLike } from 'zod-validation-error'
import { isShopifyErrorResponse } from '@/lib/errors/isShopifyErrorResponse'
import { MissingCartIdError } from '@/lib/errors/MissingCartIdError'

export const extractErrorMessage = (thrown: unknown): string => {
  if (isValidationErrorLike(thrown)) {
    return thrown.toString()
  }
  if (thrown instanceof MissingCartIdError) {
    return 'Handlingen kan ikke utføres fordi en gyldig handlekurv mangler.'
  }

  if (isShopifyErrorResponse(thrown)) {
    return 'En feil oppstod ved kommunikasjon med Shopify.'
  }

  if (thrown instanceof Error) {
    return thrown.message
  }

  return 'En uventet feil oppstod'
}
