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
import { useTransition } from 'react'
import { createDrawerStateHandler } from './utils/createDrawerStateHandler'
import { Activity } from 'react'
import { useEffect, useRef } from 'react'
import { dispatchTrackingEvent } from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import {
  buildCartTrackingData,
  shouldTrackCartDrawerView
} from '@/lib/tracking/cart/buildCartTrackingData'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'

export function CartDrawer(): React.JSX.Element {
  const open = useCartOpen()
  const { data: cart } = useCartQuery()
  const [, startTransition] = useTransition()
  const baseHandleStateChange = createDrawerStateHandler(cartStore)
  const hasTrackedView = useRef(false)

  useEffect(() => {
    const decision = shouldTrackCartDrawerView({
      open,
      hasCart: Boolean(cart),
      trackedForCurrentOpen: hasTrackedView.current
    })

    hasTrackedView.current = decision.trackedForCurrentOpen

    if (!decision.shouldTrack || !cart) {
      return
    }

    void dispatchTrackingEvent({
      eventName: 'ViewCart',
      eventId: generateEventID(),
      destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
      eventData: buildCartTrackingData(cart)
    })
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
