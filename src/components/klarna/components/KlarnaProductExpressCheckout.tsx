'use client'

import { useState } from 'react'

import { KlarnaExpressCheckoutButton } from '@/components/klarna/components/KlarnaExpressCheckoutButton'
import { buildKlarnaExpressOrderPayloadFromProductLine } from '@/components/klarna/utils/buildKlarnaExpressOrderPayload'
import type { KlarnaExpressOrderPayload } from '@/components/klarna/schemas/klarnaExpressOrderSchema'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

type KlarnaProductExpressCheckoutProps = {
  product: ShopifyProduct
  selectedVariant: ShopifyProductVariant | null
  quantity?: number
  className?: string
}

export function KlarnaProductExpressCheckout({
  product,
  selectedVariant,
  quantity = 1,
  className
}: KlarnaProductExpressCheckoutProps) {
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null)

  let orderPayload: KlarnaExpressOrderPayload | null = null

  if (selectedVariant?.availableForSale && quantity >= 1) {
    try {
      orderPayload = buildKlarnaExpressOrderPayloadFromProductLine({
        product,
        variant: selectedVariant,
        quantity
      })
    } catch {
      orderPayload = null
    }
  }

  if (!orderPayload || !selectedVariant?.availableForSale) {
    return null
  }

  return (
    <div className={className}>
      <KlarnaExpressCheckoutButton
        key={`${selectedVariant.id}-${quantity}-${orderPayload.order_amount}`}
        orderPayload={orderPayload}
        disabled={!selectedVariant.availableForSale}
        onError={message => {
          setErrorMessage(message)
        }}
      />
      {errorMessage ?
        <p
          className='text-destructive dark:text-dark-destructive mt-2 text-sm'
          role='alert'
          aria-live='polite'
        >
          {errorMessage}
        </p>
      : null}
    </div>
  )
}
