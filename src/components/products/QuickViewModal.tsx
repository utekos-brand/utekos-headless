'use client'

import { getProductAction } from '@/api/lib/products/actions'
import { AddToCart } from '@/components/cart/AddToCart'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

import { useVariantState } from '@/hooks/useVariantState'
import type { ShopifyProduct } from 'types/product'
import Image from 'next/image'
import { useEffect, useState, useEffectEvent } from 'react'
import { toast } from 'sonner'
import { VariantSelectors } from './VariantSelectors'
import { Price } from '../jsx/Price'
import { QuickViewModalSkeleton } from '../skeletons/QuickViewModalSkeleton'
import { getProductWithoutSmallSize } from './getProductWithoutSmallSize'

interface QuickViewModalProps {
  productHandle: string
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function QuickViewModal({
  productHandle,
  isOpen,
  onOpenChange
}: QuickViewModalProps) {
  const [productData, setProductData] =
    useState<ShopifyProduct | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { variantState, updateVariant } = useVariantState(
    productData ?? undefined,
    false
  )

  const handleFetchError = useEffectEvent(() => {
    toast.error(
      'Beklager, vi kunne ikke laste produktet. Vennligst prøv igjen.'
    )
    onOpenChange(false)
  })

  useEffect(() => {
    async function fetchMainProduct() {
      if (isOpen && !productData) {
        setIsLoading(true)
        try {
          const mainProduct =
            await getProductAction(productHandle)
          setProductData(
            mainProduct ?
              getProductWithoutSmallSize(mainProduct)
            : null
          )
        } catch {
          handleFetchError()
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchMainProduct()
  }, [isOpen, productHandle, productData])

  const selectedVariant =
    variantState.status === 'selected' ?
      variantState.variant
    : null
  const featuredImage =
    selectedVariant?.image ?? productData?.featuredImage

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-screen overflow-y-auto border-border bg-card text-card-foreground ring-border sm:max-w-4xl md:max-h-[70vh] [&_[data-slot=dialog-close]]:text-card-foreground [&_[data-slot=dialog-close]]:hover:bg-card-foreground/10'>
        {isLoading || !productData || !selectedVariant ?
          <div className='p-6'>
            <DialogTitle className='sr-only'>
              Laster produktinformasjon
            </DialogTitle>
            <DialogDescription className='sr-only'>
              Vinduet viser detaljer om valgt produkt.
            </DialogDescription>
            <QuickViewModalSkeleton />
          </div>
        : <>
            <DialogHeader className='space-y-3 py-2'>
              <DialogTitle className='text-3xl font-bold text-card-foreground'>
                {productData.title}
              </DialogTitle>
              {productData.description && (
                <DialogDescription
                  render={
                    <p className='max-w-2xl text-base leading-relaxed text-card-foreground/90' />
                  }
                >
                  {productData.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className='grid grid-cols-1 gap-10 pb-2 lg:grid-cols-2 lg:gap-12'>
              <div className='relative'>
                <div className='sticky top-6'>
                  <div className='relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-sm'>
                    {featuredImage && (
                      <Image
                        src={featuredImage.url}
                        alt={
                          featuredImage.altText ??
                          productData.title
                        }
                        fill
                        sizes='(max-width: 1024px) 100vw, 50vw'
                        className='object-cover'
                        priority
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className='flex flex-col gap-8'>
                <div className='space-y-2'>
                  <p className='text-sm tracking-wide text-card-foreground/80 uppercase'>
                    Pris
                  </p>
                  <div className='text-3xl font-bold text-card-foreground'>
                    <Price
                      amount={selectedVariant.price.amount}
                      currencyCode={
                        selectedVariant.price.currencyCode
                      }
                    />
                  </div>
                </div>

                <div className='space-y-6'>
                  <VariantSelectors
                    product={productData}
                    selectedVariant={selectedVariant}
                    onUpdateVariant={updateVariant}
                  />
                </div>

                <div className='mt-auto space-y-4'>
                  <AddToCart
                    product={productData}
                    selectedVariant={selectedVariant}
                  />
                </div>
              </div>
            </div>
          </>
        }
      </DialogContent>
    </Dialog>
  )
}
