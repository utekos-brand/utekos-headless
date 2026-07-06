import type { NextRequest } from 'next/server'

function normalizeOptionalSecret(value: string | undefined) {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : undefined
}

export function isAuthorizedMerchantRequest(request: NextRequest) {
  const secret =
    normalizeOptionalSecret(process.env.GOOGLE_MERCHANT_SYNC_SECRET) ||
    normalizeOptionalSecret(process.env.CRON_SECRET)

  if (!secret) {
    return false
  }

  const authorizationHeader = request.headers.get('authorization')
  const queryKey = new URL(request.url).searchParams.get('key')

  return (
    authorizationHeader === `Bearer ${secret}` ||
    queryKey === secret
  )
}
