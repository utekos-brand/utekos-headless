'use client'

import { SoldOutButton } from './SoldOutButton'
import { ActiveSubmitButton } from './ActiveSubmitButton'
import { QuickCheckoutButton } from './QuickCheckoutButton'

interface ModalSubmitButtonProps {
  availableForSale: boolean
  isAddToCartPending: boolean
  isCheckoutPending: boolean
  isDisabled: boolean
  onCheckout: () => void
}

export function ModalSubmitButton({
  availableForSale,
  isAddToCartPending,
  isCheckoutPending,
  isDisabled,
  onCheckout
}: ModalSubmitButtonProps) {
  if (!availableForSale) {
    return <SoldOutButton />
  }

  return (
    <div className='grid grid-cols-2 gap-3'>
      <ActiveSubmitButton isPending={isAddToCartPending} isDisabled={isDisabled} />
      <QuickCheckoutButton
        isPending={isCheckoutPending}
        isDisabled={isDisabled}
        onClick={onCheckout}
      />
    </div>
  )
}
