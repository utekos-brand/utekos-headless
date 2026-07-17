// Path: src/app/skreddersy-varmen/components/PurchaseClientLanding.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useLandingPurchaseLogic } from './useLandingPurchaseLogic.'
import { PurchaseClientViewLanding } from './PurchaseClientViewLanding'
import { reportCanonicalViewItem } from '@/lib/analytics/viewItemReporter'
import { createViewItemReportKey } from '@/lib/analytics/viewItemReportKey'
import type { ShopifyProduct } from 'types/product'

export function PurchaseClientLanding({
  products
}: {
  products: Record<string, ShopifyProduct | null | undefined>
}) {
  const logic = useLandingPurchaseLogic({ products })
  const reportedViewItemKey = useRef<string | null>(null)

  const { shopifyProduct, selectedShopifyVariant } = logic

  useEffect(() => {
    if (!shopifyProduct || !selectedShopifyVariant) {
      return
    }

    const reportKey = createViewItemReportKey(
      shopifyProduct.id,
      selectedShopifyVariant.id
    )

    if (reportedViewItemKey.current === reportKey) return

    return reportCanonicalViewItem({
      product: shopifyProduct,
      variant: selectedShopifyVariant,
      onEmitted: () => {
        reportedViewItemKey.current = reportKey
      }
    })
  }, [shopifyProduct, selectedShopifyVariant])

  return <PurchaseClientViewLanding {...logic} isTechDownOffer={false} />
}
