import { isValidGtin } from './isValidGtin'
import { normalizeGtin } from './normalizeGtin'

export type SchemaOrgGtinProperty = 'gtin8' | 'gtin12' | 'gtin13' | 'gtin14'

export function getSchemaOrgGtinProperty(
  value: string | null | undefined
): SchemaOrgGtinProperty | null {
  const normalizedValue = normalizeGtin(value)

  if (!normalizedValue || !isValidGtin(normalizedValue)) {
    return null
  }

  switch (normalizedValue.length) {
    case 8:
      return 'gtin8'
    case 12:
      return 'gtin12'
    case 13:
      return 'gtin13'
    case 14:
      return 'gtin14'
    default:
      return null
  }
}
