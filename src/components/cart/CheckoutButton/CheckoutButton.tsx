// Path: src/components/cart/CheckoutButton/CheckoutButton.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/className'
import { Button } from '@/components/ui/button'
import { getCheckoutAriaLabel } from './getCheckoutAriaLabel'

export const CheckoutButton = ({
  checkoutUrl,
  subtotal,
  isPending,
  disabled = false,
  disabledReason,
  className,
  children,
  ...props
}: {
  checkoutUrl: string
  subtotal: string
  isPending: boolean
  disabled?: boolean
  disabledReason?: string
  cartId?: string | null
  subtotalAmount?: string
  currency?: string
  item_ids?: string[]
  num_items?: number
  className?: string
  children?: React.ReactNode
} & Omit<
  React.ComponentProps<typeof Button>,
  'asChild' | 'disabled' | 'aria-label'
>): React.JSX.Element => {
  const isDisabled = isPending || disabled
  const buttonText =
    disabledReason ??
    children ??
    (isPending ? 'Behandler...' : 'Gå til kassen')
  const disabledAttrs =
    isDisabled ? { 'aria-disabled': true, 'tabIndex': -1 } : {}

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return
    }

    event.preventDefault()
    window.location.assign(checkoutUrl)
  }

  return (
    <Button
      asChild
      variant='secondary'
      className={cn(
        'cursor-pointer hover:brightness-95 aria-disabled:cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      aria-label={
        disabledReason ??
        getCheckoutAriaLabel(subtotal, isPending)
      }
      {...props}
    >
      <a
        href={checkoutUrl}
        onClick={handleClick}
        rel='noopener noreferrer'
        {...disabledAttrs}
      >
        {buttonText}
      </a>
    </Button>
  )
}
