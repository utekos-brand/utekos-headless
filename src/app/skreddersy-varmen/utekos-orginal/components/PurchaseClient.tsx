// Path: src/app/skreddersy-varmen/utekos-orginal/components/PurchaseClient.tsx
'use client'

import { usePurchaseLogic } from '@/hooks/usePurchaseLogic'
import { PurchaseClientView } from './PurchaseClientView'
import type { ShopifyProduct } from 'types/product'

export function PurchaseClient({
  products
}: {
  products: Record<string, ShopifyProduct | null | undefined>
}) {
  const logic = usePurchaseLogic({ products })

  return <PurchaseClientView {...logic} isTechDownOffer={false} />
}
