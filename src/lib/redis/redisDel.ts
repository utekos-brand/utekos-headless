// Path: src/lib/redis/redisDel.ts

import { getRedis } from './getRedis'
export async function redisDel(key: string) {
  const client = await getRedis()
  await client.del(key)
}
