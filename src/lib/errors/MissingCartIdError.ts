// Path: src/lib/errors/MissingCartIdError.ts

import { CartErrorCode } from '@/constants/CartErrorCode' // Oppdatert import

/**
 * A custom domain error for when the cart ID cookie is missing.
 * Allows for type-safe error handling with `instanceof`.
 * See {@link CartErrorCode} for the CartErrorCode definition.
 *
 * @module lib/errors
 */
export class MissingCartIdError extends Error {
  public readonly code = CartErrorCode.MISSING_CART_ID
  constructor() {
    super('Missing cart ID cookie.')
    this.name = 'MissingCartIdError'
  }
}
