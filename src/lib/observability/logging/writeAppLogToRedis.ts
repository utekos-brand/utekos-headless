import 'server-only'

import { getRedis } from '@/lib/redis/getRedis'
import type { AppLogEntry } from 'types/observability/log/AppLogEntry'

// Timeout should be generous to account for:
// 1. Redis client connection initialization (if not cached)
// 2. Network round-trip latency
// 3. Pipeline execution (lPush + lTrim)
// 4. Server load variability
const REDIS_LOG_TIMEOUT_MS = 2000

type RedisLogWriteResult = 'ok' | 'timeout' | Error

function createRedisLogTimeout(
  onTimeoutId: (timeoutId: ReturnType<typeof setTimeout>) => void
): Promise<'timeout'> {
  return new Promise(resolve => {
    onTimeoutId(setTimeout(() => resolve('timeout'), REDIS_LOG_TIMEOUT_MS))
  })
}

export async function writeAppLogToRedis(logEntry: AppLogEntry): Promise<void> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const writeOperation = (async (): Promise<RedisLogWriteResult> => {
    const client = await getRedis()
    await client
      .multi()
      .lPush('app_logs', JSON.stringify(logEntry))
      .lTrim('app_logs', 0, 999)
      .execAsPipeline()

    return 'ok'
  })().catch(error => (error instanceof Error ? error : new Error(String(error))))

  const result = await Promise.race([
    writeOperation,
    createRedisLogTimeout(nextTimeoutId => {
      timeoutId = nextTimeoutId
    })
  ])

  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  if (result === 'timeout') {
    void writeOperation
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Redis app log timed out after ${REDIS_LOG_TIMEOUT_MS}ms`)
    }
    return
  }

  if (result instanceof Error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to push log to Redis:', result.message)
    }
  }
}
