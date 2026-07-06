// Path: src/constants/CartErrorCode.ts

export const CartErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_CART_ID: 'MISSING_CART_ID',
  API_ERROR: 'API_ERROR',
  UNEXPECTED_SERVER_ERROR: 'UNEXPECTED_SERVER_ERROR'
} as const

export type CartErrorCodeType =
  (typeof CartErrorCode)[keyof typeof CartErrorCode]

const set = new Set<string>(Object.values(CartErrorCode))
export function isCartErrorCode(value: unknown): value is CartErrorCodeType {
  return typeof value === 'string' && set.has(value)
}
