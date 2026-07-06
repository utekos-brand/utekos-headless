import { getRedis } from './getRedis'

export async function redisSet<T>(key: string, value: T, ttlSeconds?: number) {
  const client = await getRedis()
  const payload = JSON.stringify(value)
  if (ttlSeconds) {
    await client.set(key, payload, { EX: ttlSeconds })
  } else {
    await client.set(key, payload)
  }
}
