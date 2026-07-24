// Path: src/components/cart/CartDrawer/CartDrawer.tsx
'use client'

import { CartBody } from '@/components/cart/CartBody/CartBody'
import { CartFooter } from '@/components/cart/CartFooter/CartFooter'
import { CartHeader } from '@/components/cart/CartHeader/CartHeader'
import { SmartCartSuggestions } from '@/components/cart/SmartCartSuggestions'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle
} from '@/components/ui/drawer'
import { useCartOpen } from '@/hooks/useCartOpen'
import { useCartQuery } from '@/hooks/useCartQuery'
import { cartStore } from '@/lib/state/cartStore'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import * as React from 'react'
import { useEffect, useRef, useTransition } from 'react'
import { reportCanonicalViewCart } from '@/lib/analytics/viewCartReporter'
import {
  mapShopifyViewCart,
  nextViewCartSequence
} from '@/lib/analytics/shopifyViewCartCommerce'
import { createDrawerStateHandler } from './utils/createDrawerStateHandler'
import { Activity } from 'react'

export function CartDrawer(): React.JSX.Element {
  const open = useCartOpen()
  const { data: cart } = useCartQuery()
  const [, startTransition] = useTransition()
  const lastReportedCartRevision = useRef<string | null>(null)
  const baseHandleStateChange = createDrawerStateHandler(cartStore)

  useEffect(() => {
    if (!open) {
      lastReportedCartRevision.current = null
      return
    }

    if (!cart?.id || cart.lines.length === 0) return

    const revision = `${cart.id}:${cart.totalQuantity}:${cart.lines.length}`
    if (lastReportedCartRevision.current === revision) return

    lastReportedCartRevision.current = revision

    try {
      reportCanonicalViewCart({
        customData: mapShopifyViewCart(cart, nextViewCartSequence())
      })
    } catch (error) {
      console.error('view_cart reporting failed', error)
    }
  }, [cart, open])

  const handleStateChangeWithTransition = (isOpen: boolean) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        startTransition(() => {
          baseHandleStateChange(isOpen)
        })
      })
    } else {
      startTransition(() => {
        baseHandleStateChange(isOpen)
      })
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleStateChangeWithTransition}
      direction='right'
    >
      <Activity>
        <DrawerContent className='size-full overflow-hidden bg-background text-foreground'>
          <VisuallyHidden>
            <DrawerTitle>Handlekurv</DrawerTitle>
            <DrawerDescription>
              Oversikt over varer i handlekurven og handlingsknapper.
            </DrawerDescription>
          </VisuallyHidden>

          <div className='flex flex-col h-full overflow-hidden'>
            <Activity>
              <CartHeader />
            </Activity>

            <Activity>
              <div className='flex-1 min-h-0 overflow-y-auto'>
                <CartBody />
              </div>
            </Activity>

            <Activity>
              <div className='max-h-[35vh] overflow-y-auto'>
                <SmartCartSuggestions cart={cart} />
              </div>
            </Activity>

            <Activity>
              <CartFooter cart={cart} />
            </Activity>
          </div>
        </DrawerContent>
      </Activity>
    </Drawer>
  )
}
