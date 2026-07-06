// Path: types/tracking/meta/ServiceResult.ts

export type ServiceResult = {
  success: boolean | undefined
  events_received?: number | undefined
  fbtrace_id?: string | undefined
  error?: string | undefined
  details?: any
}
