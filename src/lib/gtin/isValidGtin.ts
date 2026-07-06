import { normalizeGtin } from './normalizeGtin'

export function isValidGtin(value: string | null | undefined) {
  const normalizedValue = normalizeGtin(value)

  if (!normalizedValue || ![8, 12, 13, 14].includes(normalizedValue.length)) {
    return false
  }

  const digits = normalizedValue.split('').map(Number)
  const checkDigit = digits.pop()

  if (checkDigit === undefined) {
    return false
  }

  const weightedSum = digits
    .reverse()
    .reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 1), 0)
  const expectedCheckDigit = (10 - (weightedSum % 10)) % 10

  return expectedCheckDigit === checkDigit
}
