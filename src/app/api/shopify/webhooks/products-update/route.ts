import { handleShopifyProductCacheWebhook } from '@/lib/shopify/handleShopifyProductCacheWebhook'

export async function POST(request: Request) {
  return handleShopifyProductCacheWebhook(request, 'products/update')
}
