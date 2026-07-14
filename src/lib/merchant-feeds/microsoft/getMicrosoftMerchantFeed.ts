import 'server-only'

import { getAllProductsForCatalogSync } from '@/lib/shopify/admin'

import { buildMicrosoftMerchantFeed } from './buildMicrosoftMerchantFeed'
import { microsoftMerchantProductsSchema } from './microsoftMerchantProductsSchema'

export async function getMicrosoftMerchantFeed(): Promise<string> {
  const products = await getAllProductsForCatalogSync()
  const validatedProducts = microsoftMerchantProductsSchema.parse(products)

  return buildMicrosoftMerchantFeed(validatedProducts)
}
