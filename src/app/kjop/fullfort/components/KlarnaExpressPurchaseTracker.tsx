'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { pushGoogleDataLayerEvent } from '@/lib/tracking/google/pushGoogleDataLayerEvent'
import { KLARNA_EXPRESS_SESSION_KEY } from '@/components/klarna/constants/sessionStorage'

type StoredKlarnaExpressOrder = {
  klarna_order_id: string
  shopify_order_id: string
  shopify_order_name: string
}

export function KlarnaExpressPurchaseTracker() {
  const searchParams = useSearchParams()
  const trackedRef = useRef(false)

  useEffect(() => {
    if (trackedRef.current) {
      return
    }

    const klarnaOrderId = searchParams.get('klarna_order_id')

    if (!klarnaOrderId) {
      return
    }

    let storedOrder: StoredKlarnaExpressOrder | null = null

    try {
      const raw = sessionStorage.getItem(
        KLARNA_EXPRESS_SESSION_KEY
      )

      if (raw) {
        storedOrder = JSON.parse(raw) as StoredKlarnaExpressOrder
      }
    } catch {
      storedOrder = null
    }

    const transactionId =
      storedOrder?.shopify_order_name ||
      storedOrder?.shopify_order_id ||
      klarnaOrderId

    pushGoogleDataLayerEvent(
      'Purchase',
      `klarna-express-${transactionId}`,
      {
        transaction_id: transactionId,
        klarna_order_id: klarnaOrderId,
        shopify_order_id: storedOrder?.shopify_order_id,
        payment_method: 'klarna_express'
      }
    )

    trackedRef.current = true
  }, [searchParams])

  return null
}
