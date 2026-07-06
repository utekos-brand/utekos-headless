export function normalizeGtin(value: string | null | undefined) {
  const normalizedValue = value?.replace(/\D/g, '').trim()

  return normalizedValue ? normalizedValue : null
}
