import { useState, useTransition, useContext } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { CartIdContext } from '@/lib/context/CartIdContext'
import { cartStore } from '@/lib/state/cartStore'
import { useCartMutations } from '@/hooks/useCartMutations'
import { useOptimisticCartUpdate } from '@/hooks/useOptimisticCartUpdate'
import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import { GID_PREFIX } from '@/api/constants'
import { scrollToElement } from '@/lib/motion/scrollToElement'
import { variantMap } from '@/app/skreddersy-varmen/utekos-orginal/utils/variantMap'
import { productConfig } from '@/app/skreddersy-varmen/utekos-orginal/utils/productConfig'
import type {
  ShopifyProduct,
  ShopifyProductVariant,
  MicrofiberColor,
  MicrofiberSize
} from 'types/product'

export function useMicrofiberLogic() {
  const [color, setColor] = useState<MicrofiberColor>('fjellbla')
  const [size, setSize] = useState<MicrofiberSize>('large')
  const [isTransitioning, startTransition] = useTransition()

  const { addLines } = useCartMutations()
  const { updateCartCache } = useOptimisticCartUpdate()
  const contextCartId = useContext(CartIdContext)
  const queryClient = useQueryClient()

  const isPendingFromMachine = CartMutationContext.useSelector(state =>
    state.matches('mutating')
  )

  const activeImage = productConfig.colors.find(
    c => c.id === (color as unknown)
  )?.image

  const scrollToSizeGuide = () => {
    void scrollToElement('size-guide', { offsetY: 96 })
  }

  const handleAddToCart = () => {
    const variantIdRaw = variantMap[color]?.[size]

    if (!variantIdRaw) {
      toast.error('Kunne ikke finne varianten. Prøv en annen kombinasjon.')
      return
    }

    const variantId = `${GID_PREFIX}${variantIdRaw}`

    startTransition(async () => {
      try {
        const cartId = contextCartId || (await getCartIdFromCookie())

        if (cartId) {
          const mockProduct = {
            id: 'utekos-mikrofiber-base',
            title: 'Utekos Mikrofiber™',
            handle: 'utekos-mikrofiber',
            featuredImage: {
              url: activeImage || '',
              altText: 'Utekos Mikrofiber',
              width: 1000,
              height: 1000
            },
            productType: 'Robe'
          } as unknown as ShopifyProduct

          const mockVariant = {
            id: variantId,
            title: `${productConfig.colors.find(c => c.id === (color as unknown))?.name} / ${productConfig.sizes.find(s => s.id === (size as unknown))?.name}`,
            image: {
              url: activeImage || '',
              altText: 'Variant',
              width: 1000,
              height: 1000
            },
            price: {
              amount: productConfig.price.toString(),
              currencyCode: 'NOK'
            },
            availableForSale: true,
            selectedOptions: [
              { name: 'Farge', value: color },
              { name: 'Størrelse', value: size }
            ]
          } as unknown as ShopifyProductVariant
          await updateCartCache({
            cartId,
            items: [
              {
                product: mockProduct,
                variant: mockVariant,
                quantity: 1
              }
            ]
          })

          cartStore.send({ type: 'OPEN' })
        }

        await addLines([{ variantId, quantity: 1 }])

        if (cartId) {
          queryClient.invalidateQueries({ queryKey: ['cart', cartId] })
        }

        if (!cartId) {
          cartStore.send({ type: 'OPEN' })
        }
      } catch (error) {
        console.error('Kunne ikke legge til vare:', error)
        toast.error('Noe gikk galt. Prøv igjen.')

        const cartId = contextCartId || (await getCartIdFromCookie())
        if (cartId) {
          queryClient.invalidateQueries({ queryKey: ['cart', cartId] })
        }
      }
    })
  }

  return {
    color,
    setColor,
    size,
    setSize,
    activeImage,
    handleAddToCart,
    scrollToSizeGuide,
    isPending: isTransitioning || isPendingFromMachine
  }
}
