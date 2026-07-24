import { handleShopifyCartsUpdateRemoveFromCartWebhook } from '@/lib/analytics/server/handleShopifyCartsUpdateRemoveFromCartWebhook'

export const maxDuration = 60

export function POST(request: Request) {
  return handleShopifyCartsUpdateRemoveFromCartWebhook(request)
}
