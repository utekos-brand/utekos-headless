import { getSchemaOrgGtinProperty } from './getSchemaOrgGtinProperty'
import { normalizeGtin } from './normalizeGtin'

export function getSchemaOrgGtinData(value: string | null | undefined) {
  const property = getSchemaOrgGtinProperty(value)
  const normalizedValue = normalizeGtin(value)

  if (!property || !normalizedValue) {
    return {}
  }

  return {
    [property]: normalizedValue
  }
}
