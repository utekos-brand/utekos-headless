export type AppLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'

export type AppLogEntry = {
  event: string
  id: string
  timestamp: string
  level: AppLogLevel
  data: Record<string, unknown>
  context: Record<string, unknown>
}
