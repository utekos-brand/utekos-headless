import { timingSafeEqual } from 'node:crypto'

export function hasValidCronAuthorization(
  authorization: string | null,
  cronSecret: string | undefined
) {
  if (!authorization || !cronSecret) return false

  const provided = Buffer.from(authorization)
  const expected = Buffer.from(`Bearer ${cronSecret}`)

  return (
    provided.length === expected.length &&
    timingSafeEqual(provided, expected)
  )
}
