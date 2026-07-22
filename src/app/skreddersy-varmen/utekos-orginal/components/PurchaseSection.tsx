import { getProduct } from '@/api/lib/products/getProduct'
import { cacheLife, cacheTag } from 'next/cache'
import { PurchaseSectionClient } from './PurchaseSectionClient'

async function getMikrofiberProduct() {
  'use cache: remote'

  cacheLife('products')
  cacheTag('products', 'product-utekos-mikrofiber')

  return getProduct('utekos-mikrofiber')
}

export async function PurchaseSection() {
  const product = await getMikrofiberProduct()

  return <PurchaseSectionClient product={product ?? null} />
}
