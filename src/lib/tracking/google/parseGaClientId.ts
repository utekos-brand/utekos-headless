// Path: src/lib/tracking/google/parseGaClientId.ts

export function parseGaClientId(
  cookieValue: string | undefined
): string | null {
  if (!cookieValue) return null

  const parts = cookieValue.split('.')
  if (parts.length >= 4) {
    return parts.slice(2).join('.')
  }
  return null
}
