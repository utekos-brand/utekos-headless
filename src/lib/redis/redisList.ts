// Path: src/lib/redis/redisList.ts
import { getRedis } from './getRedis'

export async function redisList<T>(
  key: string,
  start: number = 0,
  end: number = -1
): Promise<T[]> {
  const client = await getRedis()
  const rawList = await client.lRange(key, start, end)
  return rawList.map(item => JSON.parse(item) as T)
}

export async function redisTrim(key: string, start: number, end: number) {
  const client = await getRedis()
  await client.lTrim(key, start, end)
}
