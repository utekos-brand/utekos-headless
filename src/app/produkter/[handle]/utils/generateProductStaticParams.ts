// src/app/produkter/[handle]/utils/generateProductStaticParams.ts

import { getProducts } from '@/api/lib/products/getProducts'

export type ProductStaticParam = {
  handle: string
}

export async function generateProductStaticParams(): Promise<ProductStaticParam[]> {
  const response = await getProducts({ first: 250 })

  if (!response.success || !response.body) {
    throw new Error('Failed to fetch products for generateStaticParams.')
  }

  const params = response.body
    .map(product => product.handle?.trim())
    .filter((handle): handle is string => Boolean(handle))
    .map(handle => ({ handle }))

  if (params.length === 0) {
    throw new Error(
      'generateStaticParams for /produkter/[handle] must return at least one product handle when cacheComponents is enabled.'
    )
  }

  return params
}
