'use client'

import { useAddToCartAction } from '@/hooks/useAddToCartAction'
import { useAddToCartForm } from '@/hooks/useAddToCartForm'
import { useCartErrorMonitoring } from '@/hooks/useCartErrorMonitoring'
import { AddToCartView } from './AddToCartView'
import type { AddToCartFormValues, AddToCartProps } from 'types/cart'
import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'

interface ExtendedAddToCartProps extends AddToCartProps {
  additionalProductData?: {
    product: ShopifyProduct
    variant: ShopifyProductVariant
  }
}

export function AddToCart({
  product,
  selectedVariant,
  additionalLine,
  additionalProductData
}: ExtendedAddToCartProps) {
  const {
    performAddToCart,
    performGoToCheckout,
    isPending,
    isAddToCartPending,
    isCheckoutPending
  } = useAddToCartAction({
    product,
    selectedVariant,
    additionalLine,
    ...(additionalProductData ? { additionalProductData } : {})
  })

  const form = useAddToCartForm(selectedVariant)

  useCartErrorMonitoring()

  const onSubmit = (values: AddToCartFormValues) => {
    performAddToCart(values.quantity)
  }

  const onCheckout = (values: AddToCartFormValues) => {
    void performGoToCheckout(values.quantity)
  }

  const isAvailable = selectedVariant?.availableForSale ?? false

  return (
    <AddToCartView
      form={form}
      onSubmit={onSubmit}
      onCheckout={onCheckout}
      isPending={isPending}
      isAddToCartPending={isAddToCartPending}
      isCheckoutPending={isCheckoutPending}
      isAvailable={isAvailable}
    />
  )
}
