// Path: src/components/ProductGridCard.tsx
'use client'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { cartStore } from '@/lib/state/cartStore'
import type { ProductCardProps } from '@types'
import { ShoppingBagIcon } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { findMatchingVariant } from '@/components/ProductCard/findMatchingVariant'
import { getInitialOptionsForProduct } from '@/components/ProductCard/getInitialOptionsForProduct'
import { ProductCardSoldOut } from '@/components/ProductCard/ProductCardSoldOut'

interface ExtendedProductCardProps extends ProductCardProps {
  isPriority?: boolean
  initialOptions?: Record<string, string>
}

export function ProductGridCard({
  product,
  isPriority = false,
  initialOptions
}: ExtendedProductCardProps) {
  const [selectedOptions] = useState(
    () => initialOptions ?? getInitialOptionsForProduct(product)
  )

  const cartActor = CartMutationContext.useActorRef()

  const selectedVariant = findMatchingVariant(
    product,
    selectedOptions
  )

  const fallbackImage = product.featuredImage

  const productUrl = `/produkter/${product.handle}` as Route
  const imageUrl =
    selectedVariant?.image?.url ??
    fallbackImage?.url ??
    '/placeholder.svg'
  const altText =
    selectedVariant?.image?.altText ??
    fallbackImage?.altText ??
    product.title
  const isAvailable = selectedVariant?.availableForSale ?? false

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedVariant) {
      toast.error('Vennligst velg en gyldig kombinasjon.')
      return
    }
    if (!isAvailable) {
      toast.warning('Denne varianten er dessverre utsolgt.')
      return
    }
    // ENDRET: Pakket inn input i en array []
    cartActor.send({
      type: 'ADD_LINES',
      input: [{ variantId: selectedVariant.id, quantity: 1 }]
    })
    toast.success(`${product.title} er lagt i handlekurven!`)
    cartStore.send({ type: 'OPEN' })
  }

  const lastError = CartMutationContext.useSelector(
    state => state.context.error
  )

  useEffect(() => {
    if (lastError) {
      toast.error(lastError)
    }
  }, [lastError])

  return (
    <Card className='group relative flex h-full flex-col overflow-hidden border-none bg-transparent shadow-none'>
      <div className='relative overflow-hidden rounded-lg'>
        <div className='absolute top-3 left-3'>
          <Link
            href={productUrl}
            aria-label={`Se produkt ${product.title}`}
            data-track='ProductGridCardViewMoreClick'
          >
            <AspectRatio ratio={2 / 3}>
              <Image
                src={imageUrl}
                alt={altText}
                fill
                sizes='(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw'
                className='transform object-cover transition-transform duration-300 ease-in-out group-hover:scale-105'
                priority={isPriority}
              />
            </AspectRatio>
          </Link>
        </div>
        <div className='absolute bottom-0 left-0 w-full p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          {isAvailable ?
            <Button
              onClick={handleQuickBuy}
              data-track='ProductGridCardAddToCartClick'
              className='font-utekos-text active:bg-primary-hover w-full bg-primary text-primary-foreground hover:scale-105 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto sm:whitespace-nowrap dark:active:bg-primary/90'
              aria-label='Legg i handlekurv'
            >
              <ShoppingBagIcon className='mr-2 size-4' />
              Legg i handlekurv
            </Button>
          : <ProductCardSoldOut />}
        </div>
      </div>
    </Card>
  )
}
