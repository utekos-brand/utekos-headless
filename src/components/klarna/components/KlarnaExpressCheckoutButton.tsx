'use client'

import { useEffect, useId, useRef } from 'react'

import { completeKlarnaExpressCheckout } from '@/components/klarna/utils/completeKlarnaExpressCheckout'
import { loadKlarnaExpressCheckoutSdk } from '@/components/klarna/utils/loadKlarnaExpressCheckoutSdk'
import {
  klarnaCollectedShippingAddressSchema,
  type KlarnaExpressOrderPayload
} from '@/components/klarna/schemas/klarnaExpressOrderSchema'

import type {
  KlarnaExpressCheckoutAuthorizationResult,
  KlarnaExpressCheckoutAuthorize
} from '../types'

type KlarnaExpressCheckoutButtonProps = {
  orderPayload: KlarnaExpressOrderPayload
  shopifyCartId?: string
  disabled?: boolean
  className?: string
  onError?: (message: string) => void
  onAuthorizing?: () => void
}

const KLARNA_CLIENT_ID = process.env.NEXT_PUBLIC_KLARNA_CLIENT_ID

function parseCollectedShippingAddress(
  result: KlarnaExpressCheckoutAuthorizationResult
) {
  const candidate =
    (
      typeof result.collected_shipping_address === 'object' &&
      result.collected_shipping_address !== null
    ) ?
      result.collected_shipping_address
    : result

  return klarnaCollectedShippingAddressSchema.safeParse(
    candidate
  )
}

export function KlarnaExpressCheckoutButton({
  orderPayload,
  shopifyCartId,
  disabled = false,
  className,
  onError,
  onAuthorizing
}: KlarnaExpressCheckoutButtonProps) {
  const containerSuffix = useId().replace(/:/g, '')
  const containerId = `klarna-express-checkout-${containerSuffix}`
  const payloadRef = useRef(orderPayload)
  const cartIdRef = useRef(shopifyCartId)
  const onErrorRef = useRef(onError)
  const onAuthorizingRef = useRef(onAuthorizing)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    payloadRef.current = orderPayload
    cartIdRef.current = shopifyCartId
    onErrorRef.current = onError
    onAuthorizingRef.current = onAuthorizing
  }, [onAuthorizing, onError, orderPayload, shopifyCartId])

  useEffect(() => {
    if (!KLARNA_CLIENT_ID || disabled) {
      return
    }

    let isActive = true

    void loadKlarnaExpressCheckoutSdk()
      .then(() => {
        if (
          !isActive ||
          hasInitializedRef.current ||
          !window.Klarna?.Payments?.Buttons
        ) {
          return
        }

        hasInitializedRef.current = true

        window.Klarna.Payments.Buttons.init({
          client_id: KLARNA_CLIENT_ID
        }).load(
          {
            container: `#${containerId}`,
            theme: 'default',
            shape: 'default',
            locale: 'no-NO',
            on_click: (
              authorize: KlarnaExpressCheckoutAuthorize
            ) => {
              onAuthorizingRef.current?.()

              authorize(
                {
                  auto_finalize: true,
                  collect_shipping_address: true
                },
                payloadRef.current,
                async (
                  result: KlarnaExpressCheckoutAuthorizationResult
                ) => {
                  if (
                    !result.approved ||
                    !result.authorization_token
                  ) {
                    onErrorRef.current?.(
                      'Klarna authorization was not approved'
                    )
                    return
                  }

                  const parsedAddress =
                    parseCollectedShippingAddress(result)

                  if (!parsedAddress.success) {
                    onErrorRef.current?.(
                      'Klarna did not return a valid shipping address'
                    )
                    return
                  }

                  try {
                    const completion =
                      await completeKlarnaExpressCheckout({
                        authorizationToken:
                          result.authorization_token,
                        orderPayload: payloadRef.current,
                        collectedShippingAddress:
                          parsedAddress.data,
                        ...(cartIdRef.current ?
                          { shopifyCartId: cartIdRef.current }
                        : {})
                      })

                    window.location.assign(
                      completion.redirect_url
                    )
                  } catch (error) {
                    const message =
                      error instanceof Error ?
                        error.message
                      : 'Klarna express checkout failed'

                    onErrorRef.current?.(message)
                  }
                }
              )
            }
          },
          loadResult => {
            if (loadResult.show_form === false) {
              onErrorRef.current?.(
                'Klarna express button is not available for this order'
              )
            }
          }
        )
      })
      .catch(error => {
        if (!isActive) {
          return
        }

        onErrorRef.current?.(
          error instanceof Error ?
            error.message
          : 'Klarna Payments SDK could not be loaded'
        )
      })

    return () => {
      isActive = false
    }
  }, [containerId, disabled])

  if (!KLARNA_CLIENT_ID) {
    return null
  }

  return (
    <div className={className} aria-busy={disabled}>
      <div id={containerId} />
    </div>
  )
}
