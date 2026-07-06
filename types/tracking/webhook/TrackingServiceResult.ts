// Path: types/tracking/webhook/TrackingServiceResult.ts

export type TrackingServiceResult = {
  success: boolean
  events_received?: number | undefined
  fbtrace_id?: string | undefined
  error?: string | undefined
  details?: unknown | undefined
}
