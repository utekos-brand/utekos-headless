// Path: src/app/inspirasjon/isbading/sections/ComfyrobeQuickBuy.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { ComfyrobeAccordion } from './ComfyrobeAccordion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { NewsletterForm } from '@/components/form/components/NewsLetterForm'
import { useAnalytics } from '@/hooks/useAnalytics'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { cartStore } from '@/lib/state/cartStore'
import { VippsLogo } from '@/components/payments/VippsLogo'
import { KlarnaLogo } from '@/components/payments/KlarnaLogo'
import { ShoppingBag } from 'lucide-react'
import type { ShopifyProduct } from 'types/product'
import { cn } from '@/lib/utils/className'
import { toast } from 'sonner'

interface Props {
  product: ShopifyProduct
}

export function ComfyrobeQuickBuy({ product }: Props) {
  const variants = product.variants.edges.map(e => e.node)
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | null
  >(variants.find(v => v.availableForSale)?.id || null)
  const selectedVariant = variants.find(
    v => v.id === selectedVariantId
  )
  const cartActor = CartMutationContext.useActorRef()
  const { trackEvent } = useAnalytics()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (!selectedVariant) return

    setIsAdding(true)

    cartActor.send({
      type: 'ADD_LINES',
      input: [{ variantId: selectedVariant.id, quantity: 1 }]
    })

    trackEvent('AddToCart', {
      content_name: product.title,
      content_ids: [selectedVariant.id],
      content_type: 'product',
      value: Number(selectedVariant.price.amount),
      currency: selectedVariant.price.currencyCode
    })

    setTimeout(() => {
      setIsAdding(false)
      cartStore.send({ type: 'OPEN' })
      toast.success('Lagt i handlekurven!')
    }, 600)
  }

  const images = product.images.edges
    .map(e => e.node)
    .slice(0, 5)
  const getSizeName = (title: string) => {
    const parts = title.split(' / ')
    if (parts.length > 1) {
      const sizePart = parts.find(p =>
        ['XS', 'S', 'M', 'L', 'XL'].some(s => p.includes(s))
      )
      return sizePart || parts[1]
    }
    return title
      .replace('Fjellnatt', '')
      .replace('Unisex', '')
      .replace('/', '')
      .trim()
  }

  const price = Math.round(
    Number(product.priceRange.minVariantPrice.amount)
  )

  return (
    <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12'>
      <div className='w-full'>
        <Carousel className='w-full'>
          <CarouselContent>
            {images.map(
              (img: {
                id: string
                url?: string
                altText?: string
                image?: { url?: string; altText?: string }
              }) => {
                const imageUrl = img.url || img.image?.url
                const altText =
                  img.altText ||
                  img.image?.altText ||
                  product.title

                if (!imageUrl) return null

                return (
                  <CarouselItem key={img.id}>
                    <div className='relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-background'>
                      <Image
                        src={imageUrl}
                        alt={altText}
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, 50vw'
                      />
                    </div>
                  </CarouselItem>
                )
              }
            )}
          </CarouselContent>
          <div className='block'>
            <CarouselPrevious className='left-4 border border-border bg-background/70 text-foreground backdrop-blur-md hover:bg-background' />
            <CarouselNext className='right-4 border border-border bg-background/70 text-foreground backdrop-blur-md hover:bg-background' />
          </div>
        </Carousel>
      </div>

      <div className='flex flex-col gap-6 text-left'>
        <div>
          <h2 className='mb-2 text-3xl leading-[0.95] font-bold tracking-normal text-card-foreground md:text-4xl'>
            {product.title}
          </h2>
          <div className='flex items-center gap-4'>
            <span className='text-2xl leading-[1.15] font-semibold tracking-normal text-card-foreground'>
              {price},-
            </span>
            <BrandBadge
              label='På lager'
              backgroundColor='var(--secondary)'
              textColor='var(--secondary-foreground)'
              className='border border-border px-3 py-1.5 text-xs leading-4 font-semibold tracking-normal'
            />
          </div>
        </div>

        <div className='flex gap-4'>
          <div className='flex-1 space-y-2'>
            <label className='text-sm font-medium tracking-normal text-muted-foreground'>
              Farge
            </label>
            <div className='flex h-10 cursor-default items-center justify-center rounded-md border border-border bg-secondary text-sm leading-4 font-medium tracking-normal text-secondary-foreground ring-1 ring-border'>
              Fjellnatt
            </div>
          </div>
          <div className='flex-1 space-y-2'>
            <label className='text-sm font-medium tracking-normal text-muted-foreground'>
              Modell
            </label>
            <div className='flex h-10 cursor-default items-center justify-center rounded-md border border-border bg-secondary text-sm leading-4 font-medium tracking-normal text-secondary-foreground ring-1 ring-border'>
              Unisex
            </div>
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium tracking-normal text-muted-foreground'>
              Velg størrelse
            </label>
            <Link
              href='/handlehjelp/storrelsesguide'
              className='text-xs tracking-normal text-muted-foreground underline underline-offset-4 hover:text-card-foreground'
            >
              Størrelsesguide
            </Link>
          </div>
          <div className='grid grid-cols-3 gap-3'>
            {variants.map(variant => {
              const displayName = getSizeName(variant.title)
              const isSelected = selectedVariantId === variant.id
              const isAvailable = variant.availableForSale

              return (
                <button
                  key={variant.id}
                  onClick={() =>
                    isAvailable &&
                    setSelectedVariantId(variant.id)
                  }
                  disabled={!isAvailable}
                  className={cn(
                    'relative flex h-12 items-center justify-center rounded-md border text-sm leading-4 font-medium tracking-normal transition-all',
                    isSelected ?
                      'border-primary bg-primary text-primary-foreground ring-1 ring-primary/35'
                    : 'border-border bg-background text-muted-foreground hover:border-border hover:text-card-foreground',
                    !isAvailable &&
                      'cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground/60 line-through opacity-60'
                  )}
                >
                  {displayName}
                  {!isAvailable && (
                    <span className='absolute -top-2 -right-2 rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] leading-[1.2] text-muted-foreground'>
                      Tomt
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div className='space-y-4 pt-2'>
          <BrandBadge
            asChild
            backgroundColor='var(--primary)'
            textColor='var(--primary-foreground)'
            className='min-h-14 w-full border border-transparent px-8 py-4 text-lg leading-[1.35] font-bold tracking-normal shadow-xl transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
          >
            <button
              type='button'
              onClick={handleAddToCart}
              disabled={!selectedVariant || isAdding}
            >
              {isAdding ?
                <span className='animate-pulse'>Legger til...</span>
              : <>
                  <ShoppingBag className='mr-2 h-5 w-5' />
                  Legg i handlekurv
                </>
              }
            </button>
          </BrandBadge>

          <div className='flex items-center justify-center gap-6 pt-2'>
            <div className='flex items-center gap-2'>
              <VippsLogo className='h-5 w-auto text-primary' />
            </div>
            <div className='flex items-center gap-2'>
              <KlarnaLogo className='h-6 w-auto text-muted-foreground' />
            </div>
          </div>
        </div>
        <ComfyrobeAccordion />
        <div className='mt-8 rounded-xl border border-border bg-muted/40 p-6'>
          <NewsletterForm />
        </div>
      </div>
    </div>
  )
}
