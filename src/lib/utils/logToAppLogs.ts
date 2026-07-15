// Path: src/lib/utils/logToAppLogs.ts
import { writeAppLogToRedis } from '@/lib/observability/logging/writeAppLogToRedis'
import crypto from 'crypto'
import { getVercelRuntimeContext } from '@/lib/runtime/getVercelRuntimeContext'
import type {
  AppLogEntry,
  AppLogLevel
} from 'types/observability/log/AppLogEntry'

type LogToAppLogsOptions = {
  persist?: boolean
}

export async function logToAppLogs(
  level: AppLogLevel,
  event: string,
  data?: Record<string, unknown>,
  context?: Record<string, unknown>,
  options: LogToAppLogsOptions = {}
): Promise<AppLogEntry> {
  const timestamp = new Date().toISOString()
  const logId = crypto.randomUUID()

  const logEntry = {
    event,
    id: logId,
    timestamp,
    level,
    data: data || {},
    context: {
      ...(context || {}),
      runtime: getVercelRuntimeContext()
    }
  }

  if (level === 'ERROR') {
    console.error(JSON.stringify(logEntry))
  } else {
    console.log(JSON.stringify(logEntry))
  }

  if (options.persist !== false) {
    void writeAppLogToRedis(logEntry).catch(error => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to push log to Redis:', error)
      }
    })
  }

  return logEntry
}
