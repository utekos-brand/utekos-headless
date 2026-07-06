// Path: src/app/skreddersy-varmen/components/useLandingPurchaseLogic.ts
'use client'

import { useContext, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CartIdContext } from '@/lib/context/CartIdContext'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { cartStore } from '@/lib/state/cartStore'
import { useCartMutations } from '@/hooks/useCartMutations'
import { useOptimisticCartUpdate } from '@/hooks/useOptimisticCartUpdate'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { trackAddToCart } from '@/lib/tracking/client/trackAddToCart'
import { getVariants } from '@/app/skreddersy-varmen/utekos-orginal/utils/getVariants'
import { getSelectableSizes, PRODUCT_VARIANTS } from '@/api/constants'
import type { ModelKey } from '@/api/constants'
import type { ColorVariant } from 'types/product/ProductTypes'
import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'
import type { OptimisticItemInput } from '@/hooks/useOptimisticCartUpdate'

type UseLandingPurchaseLogicProps = {
  products: Record<string, ShopifyProduct | null | undefined>
}

function normalizeSelectedSize(size: string, selectableSizes: readonly string[]): string {
  return selectableSizes.includes(size) ? size : (selectableSizes[0] ?? size)
}

export function useLandingPurchaseLogic({ products }: UseLandingPurchaseLogicProps) {
  const [selectedModel, setSelectedModelState] = useState<ModelKey>('utekos-techdown')
  const [quantity, setQuantityState] = useState(1)
  const [selectedColorIndex, setSelectedColorIndexState] = useState(0)
  const [selectedSize, setSelectedSizeState] = useState('Middels')
  const [isTransitioning, startTransition] = useTransition()

  const { addLines } = useCartMutations()
  const { updateCartCache } = useOptimisticCartUpdate()
  const queryClient = useQueryClient()
  const contextCartId = useContext(CartIdContext)

  const isPendingFromMachine = CartMutationContext.useSelector(state => state.matches('mutating'))

  const currentConfig = PRODUCT_VARIANTS[selectedModel]
  const currentShopifyProduct = products[currentConfig.id]

  const selectableSizes = getSelectableSizes(selectedModel, currentConfig)

  const safeSelectedSize = normalizeSelectedSize(selectedSize, selectableSizes)

  const safeColorIndex = selectedColorIndex < currentConfig.colors.length ? selectedColorIndex : 0

  const currentColor = currentConfig.colors[safeColorIndex] as ColorVariant | undefined

  const setQuantity = (nextQuantity: number) => {
    setQuantityState(Math.max(1, nextQuantity))
  }

  const setSelectedColorIndex = (index: number) => {
    setSelectedColorIndexState(index >= 0 && index < currentConfig.colors.length ? index : 0)
  }

  const setSelectedSize = (size: string) => {
    setSelectedSizeState(normalizeSelectedSize(size, selectableSizes))
  }

  const setSelectedModel = (model: ModelKey) => {
    const nextConfig = PRODUCT_VARIANTS[model]
    const nextSelectableSizes = getSelectableSizes(model, nextConfig)

    setSelectedModelState(model)
    setSelectedColorIndexState(index => (index >= 0 && index < nextConfig.colors.length ? index : 0))
    setSelectedSizeState(size => normalizeSelectedSize(size, nextSelectableSizes))
  }

  const resolveSelectedVariant = (): {
    product: ShopifyProduct
    selectedVariant: ShopifyProductVariant
  } | null => {
    if (!currentShopifyProduct) {
      toast.error(`Fant ikke produktdata for ${currentConfig.title}.`)
      return null
    }

    if (!currentColor) {
      toast.error(`Fant ikke fargevalg for ${currentConfig.title}.`)
      return null
    }

    const variants = getVariants(currentShopifyProduct)

    const selectedVariant = variants.find((variant: ShopifyProductVariant) => {
      const hasSize = variant.selectedOptions.some(
        option => option.value.toLowerCase() === safeSelectedSize.toLowerCase()
      )

      const hasColor = variant.selectedOptions.some(
        option => option.value.toLowerCase() === currentColor.name.toLowerCase()
      )

      return hasSize && hasColor
    })

    if (!selectedVariant) {
      toast.error(`Fant ikke variant for ${currentColor.name} / ${safeSelectedSize}.`)
      return null
    }

    if (!selectedVariant.availableForSale) {
      toast.error('Denne varianten er dessverre utsolgt for øyeblikket.')
      return null
    }

    return {
      product: currentShopifyProduct,
      selectedVariant
    }
  }

  const handleAddToCart = () => {
    if (isPendingFromMachine || isTransitioning) {
      return
    }

    startTransition(async () => {
      const resolvedVariant = resolveSelectedVariant()

      if (!resolvedVariant) {
        return
      }

      const { product, selectedVariant } = resolvedVariant
      let cartId = contextCartId || (await getCartIdFromCookie())

      try {
        const optimisticItems: OptimisticItemInput[] = [
          {
            product,
            variant: selectedVariant,
            quantity
          }
        ]

        if (cartId) {
          await updateCartCache({
            cartId,
            items: optimisticItems
          })
        }

        cartStore.send({ type: 'OPEN' })

        const mutationResult = await addLines([
          {
            variantId: selectedVariant.id,
            quantity
          }
        ])

        if (!mutationResult.success) {
          const message =
            mutationResult.message || mutationResult.error || 'Kunne ikke legge varen i handlekurven.'

          toast.error(message)

          if (cartId) {
            queryClient.invalidateQueries({ queryKey: ['cart', cartId] })
          }

          return
        }

        const cart = mutationResult.cart ?? null

        if (cart?.id) {
          cartId = cart.id
          queryClient.setQueryData(['cart', cart.id], cart)
        }

        void trackAddToCart({
          product,
          selectedVariant,
          quantity
        }).catch(error => console.error('AddToCart tracking failed', error))
      } catch (error) {
        console.error('Kunne ikke legge til vare:', error)
        toast.error('Kunne ikke legge varen i handlekurven.')

        if (cartId) {
          queryClient.invalidateQueries({ queryKey: ['cart', cartId] })
        }
      }
    })
  }

  return {
    selectedModel,
    setSelectedModel,
    quantity,
    setQuantity,
    selectedColorIndex: safeColorIndex,
    setSelectedColorIndex,
    selectedSize: safeSelectedSize,
    setSelectedSize,
    selectableSizes,
    handleAddToCart,
    isPending: isTransitioning || isPendingFromMachine,
    currentConfig,
    currentColor
  }
}
