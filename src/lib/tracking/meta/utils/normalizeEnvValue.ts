import { DOUBLE_QUOTE, SINGLE_QUOTE } from '../constants'

export function normalizeEnvValue(value: string | undefined) {
  if (!value) return undefined

  const trimmedValue = value.trim()

  if (!trimmedValue) return undefined

  if (
    (trimmedValue.startsWith(DOUBLE_QUOTE) && trimmedValue.endsWith(DOUBLE_QUOTE))
    || (trimmedValue.startsWith(SINGLE_QUOTE) && trimmedValue.endsWith(SINGLE_QUOTE))
  ) {
    const unwrappedValue = trimmedValue.slice(1, -1).trim()
    return unwrappedValue || undefined
  }

  return trimmedValue
}
