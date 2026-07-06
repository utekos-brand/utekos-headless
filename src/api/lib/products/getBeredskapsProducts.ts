'use server'
// Path: src/api/lib/products/getBeredskapsProducts.ts
import { BEREDSKAPSPRODUKTER } from '@/db/data/products/product-info'
import { getProducts } from './getProducts'
export async function getBeredskapsProducts() {
  const response = await getProducts()

  if (!response.success || !response.body || response.body.length === 0) {
    return []
  }

  const beredskapsProducts = response.body.filter(product =>
    BEREDSKAPSPRODUKTER.includes(product.handle)
  )

  beredskapsProducts.sort((a, b) => {
    const indexA = BEREDSKAPSPRODUKTER.indexOf(a.handle)
    const indexB = BEREDSKAPSPRODUKTER.indexOf(b.handle)
    return indexA - indexB
  })

  return beredskapsProducts
}
