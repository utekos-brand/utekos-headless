export type LogPayload = {
  event: string
  level?: 'info' | 'warn' | 'error'
  data?: Record<string, unknown>
  context?: Record<string, unknown>
}
