import { handleShopifyRefundsCreateWebhook } from '@/lib/analytics/server/handleShopifyRefundsCreateWebhook'

export const maxDuration = 60

export function POST(request: Request) {
  return handleShopifyRefundsCreateWebhook(request)
}
