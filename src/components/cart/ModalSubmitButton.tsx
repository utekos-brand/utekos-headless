'use client'

import { SoldOutButton } from './SoldOutButton'
import { QuickCheckoutButton } from './QuickCheckoutButton'
import { KlarnaProductExpressCheckout } from '@/components/klarna/components/KlarnaProductExpressCheckout'
import type { ShopifyProduct } from 'types/product/ShopifyProduct'
import type { ShopifyProductVariant } from 'types/product/ShopifyProductVariant'

interface ModalSubmitButtonProps {
  product: ShopifyProduct
  selectedVariant: ShopifyProductVariant | null
  quantity: number
  availableForSale: boolean
  isCheckoutPending: boolean
  isDisabled: boolean
  onCheckout: () => void
}

export function ModalSubmitButton({
  product,
  selectedVariant,
  quantity,
  availableForSale,
  isCheckoutPending,
  isDisabled,
  onCheckout
}: ModalSubmitButtonProps) {
  if (!availableForSale || !selectedVariant) {
    return <SoldOutButton />
  }

  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
      <KlarnaProductExpressCheckout
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        className='w-full min-w-0'
        buttonContainerClassName='h-14 min-h-14'
      />
      <QuickCheckoutButton
        isPending={isCheckoutPending}
        isDisabled={isDisabled}
        onClick={onCheckout}
      />
    </div>
  )
}
