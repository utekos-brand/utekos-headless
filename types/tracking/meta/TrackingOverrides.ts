// Path: types/tracking/meta/TrackingOverrides.ts
type TrackingOverrides = {
  clientId?: string
  sessionId?: string
  fbp?: string
  fbc?: string
  userId?: string
  timestampMicros?: number
  userData?: Record<string, any>
  userProperties?: Record<string, any>
  userAgent?: string
  ipOverride?: string
  debugMode?: boolean
}

function toGaUserProperties(
  props?: Record<string, unknown>
): Record<string, { value: string | number | boolean }> | undefined {
  if (!props) return undefined

  const entries = Object.entries(props).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  )

  if (!entries.length) return undefined

  return Object.fromEntries(
    entries.map(([key, value]) => [
      key,
      { value: value as string | number | boolean }
    ])
  )
}