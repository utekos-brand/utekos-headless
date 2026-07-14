// Path: src/components/ProductCard/ProductCard.tsx
'use client'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { cartStore } from '@/lib/state/cartStore'
import { generateEventID } from '@/components/analytics/Meta/generateEventID'
import { dispatchTrackingEvent } from '@/lib/tracking/dispatch/dispatchTrackingEvent'
import { cleanShopifyId } from '@/lib/utils/cleanShopifyId'
import { formatPrice } from '@/lib/utils/formatPrice'
import { cn } from '@/lib/utils/className'
import type { ProductCardProps } from '@types'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { findMatchingVariant } from './findMatchingVariant'
import { getInitialOptionsForProduct } from './getInitialOptionsForProduct'
import { ProductCardFooter } from './ProductCardFooter'
import { ProductCardHeader } from './ProductCardHeader'
import { H3 } from '@/components/typography/TypographyH3'
import { InlineText } from '@/components/typography/TypographyInlineText'
import { KlarnaProductExpressCheckout } from '@/components/klarna/components/KlarnaProductExpressCheckout'
import { ProductCardCompactVariantSelector } from './ProductCardCompactVariantSelector'

interface ExtendedProductCardProps extends ProductCardProps {
  isPriority?: boolean
  initialOptions?: Record<string, string>
  compactMobile?: boolean
  cardClassName?: string
}

export function ProductCard({
  product,
  colorHexMap,
  isPriority = false,
  initialOptions,
  listTrackingContext,
  compactMobile = false,
  cardClassName
}: ExtendedProductCardProps) {
  const [selectedOptions, setSelectedOptions] = useState(
    () => initialOptions ?? getInitialOptionsForProduct(product)
  )

  const cartActor = CartMutationContext.useActorRef()
  const isPending = CartMutationContext.useSelector(state =>
    state.matches('mutating')
  )

  const selectedVariant = findMatchingVariant(
    product,
    selectedOptions
  )

  const fallbackPrice = product.priceRange.minVariantPrice
  const fallbackImage = product.featuredImage

  const price = formatPrice(
    selectedVariant?.price ?? fallbackPrice
  )

  const baseUrl = `/produkter/${product.handle}`
  const variantQuery =
    selectedVariant ?
      `?variant=${encodeURIComponent(selectedVariant.id)}`
    : ''
  const productUrl = `${baseUrl}${variantQuery}` as Route
  const imageUrl =
    selectedVariant?.image?.url ??
    fallbackImage?.url ??
    '/placeholder.svg'
  const altText =
    selectedVariant?.image?.altText ??
    fallbackImage?.altText ??
    product.title
  const isAvailable = selectedVariant?.availableForSale ?? false
  const imageSizes =
    compactMobile ?
      '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw'
    : '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw'

  const trackProductSelect = () => {
    if (!selectedVariant || !listTrackingContext) {
      return
    }

    const contentId =
      cleanShopifyId(selectedVariant.id) || selectedVariant.id
    const price = Number(selectedVariant.price.amount)

    void dispatchTrackingEvent({
      eventName: 'SelectItem',
      eventId: generateEventID(),
      destinations: ['google', 'meta', 'microsoft_uet', 'posthog'],
      eventData: {
        value: Number.isFinite(price) ? price : undefined,
        currency: selectedVariant.price.currencyCode,
        content_name: product.title,
        content_type: 'product',
        content_category:
          product.productType || 'Utekos products',
        content_ids: [contentId],
        contents: [
          {
            id: contentId,
            quantity: 1,
            item_price:
              Number.isFinite(price) ? price : undefined,
            item_name: product.title,
            item_brand: product.vendor || 'Utekos',
            item_category:
              product.productType || 'Utekos products',
            item_variant: selectedVariant.title,
            item_list_id: listTrackingContext.itemListId,
            item_list_name: listTrackingContext.itemListName,
            index: listTrackingContext.index
          }
        ],
        item_list_id: listTrackingContext.itemListId,
        item_list_name: listTrackingContext.itemListName,
        num_items: 1
      }
    })
  }

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

    cartActor.send({
      type: 'ADD_LINES',
      input: [{ variantId: selectedVariant.id, quantity: 1 }]
    })
    toast.success(
      `${selectedVariant.title} er lagt i handlekurven!`
    )
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

  const compactProductCardContent =
    compactMobile ?
      <Link
        href={productUrl}
        data-track='ProductCardViewMoreClick'
        onClick={trackProductSelect}
        aria-label={`Se produkt ${product.title}`}
        className='dark:focus-visible:outline-dark-card-foreground flex w-full flex-1 flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card-foreground md:hidden'
      >
        <CardContent className='relative p-0'>
          {product.handle === 'utekos-dun' ?
            <Badge
              variant='destructive'
              className='bg-disabled  absolute top-2 right-2 z-10 border border-border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-foreground uppercase'
            >
              <InlineText>Utsolgt</InlineText>
            </Badge>
          : null}

          <AspectRatio
            ratio={1 / 1}
            className='w-full overflow-hidden'
          >
            <Image
              src={imageUrl}
              alt={altText}
              fill
              quality={100}
              sizes='(min-width: 640px) 50vw, 82vw'
              className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
              fetchPriority={isPriority ? 'high' : 'low'}
              loading={isPriority ? 'eager' : 'lazy'}
            />
          </AspectRatio>
        </CardContent>

        <div className='dark:border-dark-card-foreground/24 flex flex-col gap-1.5 border-t border-card-foreground/24 p-3'>
          <div className='flex items-start justify-between gap-2'>
            <H3 className='line-clamp-2 min-w-0 flex-1 pb-0 text-[0.82rem] leading-snug font-semibold text-balance text-card-foreground'>
              {product.title}
            </H3>
            <BrandBadge
              backgroundColor='var(--background)'
              textColor='var(--foreground)'
              className='shrink-0 border border-foreground/12 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide dark:border-dark-foreground/12'
            >
              <InlineText>Unisex</InlineText>
            </BrandBadge>
          </div>
          <InlineText className='text-sm leading-none font-bold text-card-foreground'>
            {price}
          </InlineText>
        </div>
      </Link>
    : null

  const compactProductVariantSelector =
    compactMobile ?
      <ProductCardCompactVariantSelector
        options={product.options}
        selectedOptions={selectedOptions}
        onOptionChange={setSelectedOptions}
        productTitle={product.title}
      />
    : null

  return (
    <Card
      className={cn(
        'group flex h-full flex-col gap-0 overflow-hidden border border-border bg-card p-0 text-card-foreground shadow-[0_18px_56px_-42px_rgba(8,10,24,0.85)]',
        cardClassName
      )}
    >
      {compactProductCardContent}
      {compactProductVariantSelector}
      <div
        className={compactMobile ? 'hidden md:contents' : 'contents'}
      >
        <CardContent className='relative p-0'>
          <Link
            href={productUrl}
            data-track='ProductCardViewMoreClick'
            onClick={trackProductSelect}
            aria-label={`Se produkt ${product.title}`}
            className='dark:focus-visible:outline-dark-card-foreground block w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card-foreground'
          >
            <BrandBadge
              backgroundColor='var(--background)'
              textColor='var(--foreground)'
              className={cn(
                'absolute top-4 left-4 z-10 border border-foreground/12 px-3 py-1 text-xs font-medium tracking-wide shadow-[0_12px_28px_-22px_rgba(32,28,54,0.58)] dark:border-dark-foreground/12',
                compactMobile &&
                  'top-2 left-2 px-2 py-0.5 text-[0.65rem] md:top-4 md:left-4 md:px-3 md:py-1 md:text-xs'
              )}
            >
              <InlineText>Unisex</InlineText>
            </BrandBadge>

            {product.handle === 'utekos-dun' ?
              <Badge
                variant='destructive'
                className={cn(
                  'bg-disabled  absolute top-4 right-4 z-10 border border-border px-3 py-1 text-xs font-medium tracking-wide text-foreground uppercase',
                  compactMobile &&
                    'top-2 right-2 px-2 py-0.5 text-[0.65rem] md:top-4 md:right-4 md:px-3 md:py-1 md:text-xs'
                )}
              >
                <InlineText>Utsolgt</InlineText>
              </Badge>
            : null}

            <AspectRatio
              ratio={1 / 1}
              className='w-full overflow-hidden'
            >
              <Image
                src={imageUrl}
                alt={altText}
                fill
                quality={100}
                sizes={imageSizes}
                className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                fetchPriority={isPriority ? 'high' : 'low'}
                loading={isPriority ? 'eager' : 'lazy'}
              />
            </AspectRatio>
          </Link>
        </CardContent>

        <ProductCardHeader
          title={product.title}
          options={product.options}
          colorHexMap={colorHexMap}
          selectedOptions={selectedOptions}
          onOptionChange={setSelectedOptions}
          productUrl={productUrl}
          onViewProduct={trackProductSelect}
          compactMobile={compactMobile}
        />

        <ProductCardFooter
          price={price}
          productUrl={productUrl}
          isAvailable={isAvailable}
          isPending={isPending}
          onQuickBuy={handleQuickBuy}
          onViewProduct={trackProductSelect}
          compactMobile={compactMobile}
        />
      </div>
      <KlarnaProductExpressCheckout
        product={product}
        selectedVariant={selectedVariant ?? null}
        className={cn(
          'w-full px-6 pb-6',
          compactMobile &&
            'dark:border-dark-card-foreground/24 border-t border-card-foreground/24 px-2 pt-2 pb-2 md:border-t-0 md:px-6 md:pt-0 md:pb-6'
        )}
      />
    </Card>
  )
}
