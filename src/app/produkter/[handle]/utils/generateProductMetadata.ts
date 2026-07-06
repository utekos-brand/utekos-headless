import type { Metadata } from 'next'
import { buildMissingProductMetadata } from './buildMissingProductMetadata'
import { buildProductMetadata } from './buildProductMetadata'
import { getCachedProductForMetadata } from './getCachedProductForMetadata'

export async function generateProductMetadata(handle: string): Promise<Metadata> {
  const product = await getCachedProductForMetadata(handle)

  if (!product) {
    return buildMissingProductMetadata()
  }

  return buildProductMetadata(product, handle)
}
