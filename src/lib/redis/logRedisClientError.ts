import { isRedisTimeoutError } from '@/lib/redis/isRedisTimeoutError'

export function logRedisClientError(error: Error) {
  if (process.env.NODE_ENV === 'production' && isRedisTimeoutError(error)) return

  console.warn('Redis Client Error', error)
}
