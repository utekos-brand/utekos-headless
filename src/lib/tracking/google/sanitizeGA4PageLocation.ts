const MAX_GA4_MEASUREMENT_PROTOCOL_PARAM_LENGTH = 100

export function sanitizeGA4PageLocation(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  try {
    const url = new URL(value)
    const pageLocation = `${url.origin}${url.pathname}`

    return pageLocation.length <= MAX_GA4_MEASUREMENT_PROTOCOL_PARAM_LENGTH
      ? pageLocation
      : undefined
  } catch {
    return undefined
  }
}
