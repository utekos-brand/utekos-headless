'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { useAnalytics } from '@/hooks/useAnalytics'
import type { ProductViewProps } from 'types/product/PageProps'

export function ProductViewTracking({
  product,
  selectedVariant
}: ProductViewProps) {
  const pathname = usePathname()
  const eventFired = useRef<string | null>(null)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    const contentId = cleanShopifyId(selectedVariant.id) || selectedVariant.id
    const uniqueKey = `${pathname}-${contentId}`
    if (eventFired.current === uniqueKey) return
    eventFired.current = uniqueKey

    const eventId = generateEventID()
    const price = parseFloat(selectedVariant.price.amount)
    const currency = selectedVariant.price.currencyCode
    const category = product.productType || 'Apparel'

    trackEvent(
      'ViewContent',
      {
        value: price,
        currency: currency,
        content_ids: [contentId],
        content_type: 'product',
        content_name: product.title,
        content_category: category,
        contents: [
          {
            id: contentId,
            quantity: 1,
            item_price: price,
            item_name: product.title,
            item_brand: product.vendor || 'Utekos',
            item_category: category,
            item_variant: selectedVariant.title
          }
        ],
        num_items: 1
      },
      { eventID: eventId }
    )

  }, [
    pathname,
    product.title,
    product.productType,
    product.vendor,
    selectedVariant.id,
    selectedVariant.price,
    selectedVariant.title,
    trackEvent
  ])

  return null
}
