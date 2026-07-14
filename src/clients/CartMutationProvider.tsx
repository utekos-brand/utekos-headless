// Path: src/clients/CartMutationProvider.tsx
'use client'

import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { createCartMutationMachine } from '@/lib/state/createCartMutationMachine'
import type { Cart, CartActions } from 'types/cart'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { dispatchTrackingEvent } from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import { buildCartLineTrackingData } from '@/lib/tracking/cart/buildCartTrackingData'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'

export function CartMutationProvider({
  actions,
  children,
  cartId,
  setCartId
}: {
  actions: CartActions
  children: React.ReactNode
  cartId: string | null
  setCartId: (cartId: string) => void
}) {
  const queryClient = useQueryClient()
  const trackedActions: CartActions = {
    ...actions,
    removeCartLine: async input => {
      const currentCart = cartId ? queryClient.getQueryData<Cart>(['cart', cartId]) : undefined
      const removedLine = currentCart?.lines.find(line => line.id === input.lineId)
      const result = await actions.removeCartLine(input)

      if (result.success && removedLine) {
        void dispatchTrackingEvent({
          eventName: 'RemoveFromCart',
          eventId: generateEventID(),
          destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
          eventData: buildCartLineTrackingData(removedLine)
        })
      }

      return result
    }
  }

  const updateCartCache = (newCart: Cart) => {
    if (newCart?.id) {
      queryClient.setQueryData(['cart', newCart.id], newCart)
    }
  }

  const cartMutationMachine = createCartMutationMachine(
    trackedActions,
    updateCartCache,
    setCartId
  )

  return (
    <CartMutationContext.Provider logic={cartMutationMachine}>
      {children}
    </CartMutationContext.Provider>
  )
}
