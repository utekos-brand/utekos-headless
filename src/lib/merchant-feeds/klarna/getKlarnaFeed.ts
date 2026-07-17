import 'server-only'

import { getAllProductsForCatalogSync } from '@/lib/shopify/admin'

import { catalogSyncProductsSchema } from '../catalogSyncProductsSchema'
import { buildKlarnaFeed } from './buildKlarnaFeed'

export async function getKlarnaFeed(): Promise<string> {
  const products = await getAllProductsForCatalogSync()
  const validatedProducts = catalogSyncProductsSchema.parse(products)

  return buildKlarnaFeed(validatedProducts)
}
