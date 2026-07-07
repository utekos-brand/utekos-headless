// Path: src/components/cart/CheckoutButton/CheckoutButton.tsx
'use client'

import { track } from '@vercel/analytics'
import * as React from 'react'
import { cn } from '@/lib/utils/className'
import { dispatchMetaTrackingEvent } from '@/lib/tracking/meta/dispatchMetaTrackingEvent'
import { getClientMetaUserData } from '@/lib/tracking/meta/utils/getClientMetaUserData'
import { Button } from '@/components/ui/button'
import type {
  CaptureBody,
  MetaUserData
} from 'types/tracking/meta'
import { getCheckoutAriaLabel } from './getCheckoutAriaLabel'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { getCookie } from '@/components/analytics/Meta/getCookie'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import { hasCategoryConsent } from '@/lib/tracking/consent/hasCategoryConsent'
import { hasServiceConsent } from '@/lib/tracking/consent/hasServiceConsent'
import {
  USERCENTRICS_META_SERVICE_NAME,
  USERCENTRICS_VERCEL_ANALYTICS_SERVICE_NAME
} from '@/components/cookie-consent/usercentricsConfig'

const CHECKOUT_TRACKING_NAVIGATION_TIMEOUT_MS = 1200

function waitForCheckoutTrackingDeadline() {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, CHECKOUT_TRACKING_NAVIGATION_TIMEOUT_MS)
  })
}

export const CheckoutButton = ({
  checkoutUrl,
  subtotal,
  isPending,
  disabled = false,
  disabledReason,
  cartId,
  subtotalAmount,
  currency,
  item_ids,
  num_items,
  className,
  children,
  ...props
}: {
  checkoutUrl: string
  subtotal: string
  isPending: boolean
  disabled?: boolean
  disabledReason?: string
  cartId: string | null | undefined
  subtotalAmount: string
  currency: string
  item_ids: string[]
  num_items: number
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

  const trackCheckout = async () => {
    if (isDisabled) return

    if (!cartId) {
      console.error('CheckoutButton onClick: Missing cartId!')
      return
    }

    try {
      const cleanItemIds = item_ids.map(
        id => cleanShopifyId(id) || id
      )

      const rawEventID = generateEventID()
      const eventID = rawEventID.replace('evt_', 'ic_')
      const value = Number.parseFloat(subtotalAmount || '0') || 0
      const userData: MetaUserData | undefined =
        hasServiceConsent(USERCENTRICS_META_SERVICE_NAME) ?
          getClientMetaUserData()
        : undefined

      const metaId = userData?.fbc

      const sources = []

      if (metaId) sources.push('Meta 💙')

      if (sources.length > 0) {
        const sourceLabel = sources.join(' + ')

        fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'INFO',
            event: `💳 InitiateCheckout fra ${sourceLabel}`,
            context: {
              source: sourceLabel,
              value,
              cartId,
              hasMetaId: !!metaId
            }
          })
        }).catch(() => {})
      }

      if (hasCategoryConsent('marketing')) {
        const captureBody: CaptureBody = {
          cartId,
          checkoutUrl,
          eventId: eventID,
          ...(userData ? { userData } : {})
        }

        fetch('/api/checkout/capture-identifiers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(captureBody),
          keepalive: true
        }).catch(err =>
          console.error('Capture identifiers failed', err)
        )
      }

      await dispatchMetaTrackingEvent({
        eventName: 'InitiateCheckout',
        eventId: eventID,
        eventData: {
          value,
          currency,
          content_ids: cleanItemIds,
          content_type: 'product',
          num_items
        },
        ...(userData ? { userData } : {})
      })
    } catch (error) {
      console.error(
        'Feil under sending av checkout-events:',
        error
      )
    }
  }

  const trackAnalytics = () => {
    if (isDisabled) return

    if (
      hasServiceConsent(
        USERCENTRICS_VERCEL_ANALYTICS_SERVICE_NAME
      )
    ) {
      track('Vercel Analytics', {
        event: 'CheckoutButtonClick',
        quantity: num_items || 1,
        value: subtotalAmount,
        currency,
        cart_id: cartId || 'unknown',
        _fpc: getCookie('_fpc'),
        external_id: getCookie('ute_ext_id') || 'unknown',
        event_name: 'CheckoutButtonClick',
        event_id: generateEventID()
      })
    }
  }

  const handleClick = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
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
      trackAnalytics()
      void trackCheckout()
      return
    }

    event.preventDefault()
    trackAnalytics()
    await Promise.race([
      trackCheckout(),
      waitForCheckoutTrackingDeadline()
    ])
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
      data-track='CheckoutButtonClick'
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
