import { sanitizeGA4PageLocation } from './sanitizeGA4PageLocation'

export function sanitizeGA4EventParams(
  params: Record<string, unknown>
): Record<string, unknown> {
  const safeParams = { ...params }
  const pageLocation = sanitizeGA4PageLocation(params.page_location)
  delete safeParams.page_location

  return {
    ...safeParams,
    ...(pageLocation ? { page_location: pageLocation } : {})
  }
}
