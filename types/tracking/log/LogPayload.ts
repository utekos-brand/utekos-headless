// Path: types/tracking/log/LogPayload.ts

export type LogPayload = {
  event: string
  level?: 'info' | 'warn' | 'error'
  data?: Record<string, unknown>
  context?: Record<string, unknown>
}
