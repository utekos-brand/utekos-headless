// Path: src/lib/redis/redisGet.ts

import { getRedis } from '@/lib/redis/getRedis'

export async function redisGet<T>(key: string): Promise<T | null> {
  const client = await getRedis()
  const raw = await client.get(key)
  return raw ? (JSON.parse(raw) as T) : null
}
