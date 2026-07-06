// Path: src/lib/redis/redisPush.ts
import { getRedis } from '@/lib/redis/getRedis'

export async function redisPush<T>(key: string, value: T) {
  const client = await getRedis()
  const payload = JSON.stringify(value)
  await client.lPush(key, payload)
}
