import { isRedisTimeoutError } from '@/lib/redis/isRedisTimeoutError'
import { REDIS_MAX_RECONNECT_ATTEMPTS } from '@/lib/redis/redisConnectionConfig'

export function shouldStopRedisReconnect(retries: number, cause: unknown): boolean {
  if (retries >= REDIS_MAX_RECONNECT_ATTEMPTS) return true

  if (cause instanceof Error) {
    return isRedisTimeoutError(cause)
  }

  return false
}
