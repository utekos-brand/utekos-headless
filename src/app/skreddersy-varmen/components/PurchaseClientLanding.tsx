// Path: src/app/skreddersy-varmen/components/PurchaseClientLanding.tsx
'use client'

import { useLandingPurchaseLogic } from './useLandingPurchaseLogic.'
import { PurchaseClientViewLanding } from './PurchaseClientViewLanding'
import type { ShopifyProduct } from 'types/product'

export function PurchaseClientLanding({
  products
}: {
  products: Record<string, ShopifyProduct | null | undefined>
}) {
  const logic = useLandingPurchaseLogic({ products })

  return <PurchaseClientViewLanding {...logic} isTechDownOffer={false} />
}
