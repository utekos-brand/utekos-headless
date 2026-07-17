export function parseAbsoluteHttpUrl(
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined
    }

    return url.toString()
  } catch {
    return undefined
  }
}
