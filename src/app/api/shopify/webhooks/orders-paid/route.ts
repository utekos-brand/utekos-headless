import { handleShopifyOrdersPaidWebhook } from '@/lib/analytics/server/handleShopifyOrdersPaidWebhook'

export const maxDuration = 60

export function POST(request: Request) {
  return handleShopifyOrdersPaidWebhook(request)
}
