// Path : src/lib/redis/redisTrim.ts
import { getRedis } from './getRedis'

export async function redisTrim(key: string, start: number, end: number) {
  const client = await getRedis()
  await client.lTrim(key, start, end)
}
