// Path: src/app/skreddersy-varmen/components/LandingPurchaseSection.tsx

import { PurchaseClientLanding } from './PurchaseClientLanding'
import { getProduct } from '@/api/lib/products/getProduct'
import { cacheLife, cacheTag } from 'next/cache'

async function getLandingPurchaseProducts() {
  'use cache: remote'

  cacheLife('products')
  cacheTag(
    'products',
    'product-utekos-techdown',
    'product-utekos-mikrofiber'
  )

  return Promise.all([
    getProduct('utekos-techdown'),
    getProduct('utekos-mikrofiber')
  ])
}

export async function LandingPurchaseSection() {
  const [techDown, mikro] = await getLandingPurchaseProducts()

  const productsMap = {
    'utekos-techdown': techDown,
    'utekos-mikrofiber': mikro
  }

  if (!techDown) {
    return (
      <div className='w-full bg-foreground-muted px-6 py-16 text-background dark:text-dark-background'>
        <div className='mx-auto max-w-3xl rounded-sm border border-background/12 dark:border-dark-background/12 bg-foreground dark:bg-dark-foreground p-6 text-center shadow-sm'>
          <p className='font-sans text-xl font-bold'>
            Produktvalget er midlertidig utilgjengelig
          </p>
          <p className='text-l mt-2 leading-relaxed text-background/75 dark:text-dark-background/75'>
            Landingssiden er lastet, men produktdata kunne ikke
            hentes akkurat nå.
          </p>
        </div>
      </div>
    )
  }

  return <PurchaseClientLanding products={productsMap} />
}
