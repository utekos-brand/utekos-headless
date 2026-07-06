// Path: src/components/cart/CartFooter/CartFooter.tsx
import * as React from 'react'

import { CheckoutButton } from '@/components/cart/CheckoutButton/CheckoutButton'
import { DrawerFooter } from '@/components/ui/drawer'
import { useCartPending } from '@/hooks/useCartPending'
import { formatPrice } from '@/lib/utils/formatPrice'
import { SubtotalDisplay } from './SubTotalDisplay'
import { shouldRenderFooter } from './utils/shouldRenderFooter'
import type { Cart } from 'types/cart'

export const CartFooter = ({ cart }: { cart: Cart | null | undefined }): React.JSX.Element | null => {
  const isPending = useCartPending()

  if (!shouldRenderFooter(cart)) {
    return null
  }

  const unavailableLines = cart!.lines.filter(line => !line.merchandise.availableForSale)

  const hasUnavailableLines = unavailableLines.length > 0

  const subtotalFormatted = formatPrice(cart!.cost.subtotalAmount)
  const cartId = cart!.id
  const subtotalAmount = cart!.cost.subtotalAmount.amount
  const currency = cart!.cost.subtotalAmount.currencyCode
  const itemIds = cart!.lines.map(line => line.merchandise.id)
  const numItems = cart!.totalQuantity

  const disabledReason =
    hasUnavailableLines ? 'Fjern utsolgte varer fra handlekurven før du går til kassen.' : undefined

  return (
    <DrawerFooter className='border-t border-border bg-background'>
      {hasUnavailableLines && (
        <div
          role='alert'
          className='rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm leading-snug text-destructive'
        >
          En eller flere varer i handlekurven er ikke lenger tilgjengelige. Fjern dem før du går til kassen.
        </div>
      )}

      <SubtotalDisplay subtotal={subtotalFormatted} />

      <CheckoutButton
        checkoutUrl={cart!.checkoutUrl}
        subtotal={subtotalFormatted}
        isPending={isPending > 0}
        disabled={hasUnavailableLines}
        {...(disabledReason === undefined ? {} : { disabledReason })}
        cartId={cartId}
        subtotalAmount={subtotalAmount}
        currency={currency}
        item_ids={itemIds}
        num_items={numItems}
        className='mt-4'
      />
    </DrawerFooter>
  )
}
