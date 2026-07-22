'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { AddToCart } from '@/components/cart/AddToCart'
import { ProductGallery } from '@/components/jsx/ProductGallery'
import { KlarnaCreditPromotionAutoSize } from '@/components/klarna/components/KlarnaCreditPromotionAutoSize'
import { KlarnaOnSiteMessagingScript } from '@/components/klarna/components/KlarnaOnSiteMessagingScript'
import { getKlarnaMinorUnitAmount } from '@/components/klarna/utils/getKlarnaMinorUnitAmount'
import { renderOptionComponent } from '@/app/produkter/[handle]/utils/renderOptionComponent'
import PriceActivityPanel from '@/app/produkter/[handle]/components/PriceActivityPanel'
import { TrustSignals } from '@/app/produkter/[handle]/components/TrustSignals'
import { createSwatchColorMap } from '@/hooks/createSwatchColorMap'
import { useVariantState } from '@/hooks/useVariantState'
import { reshapeProductWithMetafields } from '@/hooks/useProductWithMetafields'
import { getSortedOptions } from '@/lib/helpers/async/getSortedOptions'
import { reportCanonicalViewItem } from '@/lib/analytics/viewItemReporter'
import { createViewItemReportKey } from '@/lib/analytics/viewItemReportKey'
import { getComfyrobeLandingGalleryImages } from '../utils/getComfyrobeLandingGalleryImages'
import type { ShopifyProduct } from 'types/product'

interface ComfyrobePurchaseExperienceProps {
  product: ShopifyProduct
  initialVariantId: string | null
}

const HERO_PROOFS = [
  '8000 mm vannsøyle og tapede sømmer',
  'Vindtett HydroGuard™-ytterstoff',
  'Varmt SherpaCore™-fôr på 250 GSM'
] as const

export function ComfyrobePurchaseExperience({
  product,
  initialVariantId
}: ComfyrobePurchaseExperienceProps) {
  const reportedViewItemKey = useRef<string | null>(null)
  const productData = reshapeProductWithMetafields(product) || product
  const { variantState, updateVariant, allVariants } = useVariantState(
    productData,
    true,
    initialVariantId
  )
  const selectedVariant =
    variantState.status === 'selected' ? variantState.variant : null
  const colorHexMap = createSwatchColorMap(productData)
  const sortedProductOptions = getSortedOptions(productData.options, [
    'Størrelse',
    'Farge'
  ])
  const galleryImages = getComfyrobeLandingGalleryImages()

  useEffect(() => {
    if (!selectedVariant) return

    const reportKey = createViewItemReportKey(
      productData.id,
      selectedVariant.id
    )

    if (reportedViewItemKey.current === reportKey) return

    return reportCanonicalViewItem({
      product: productData,
      variant: selectedVariant,
      onEmitted: () => {
        reportedViewItemKey.current = reportKey
      }
    })
  }, [productData, selectedVariant])

  if (!selectedVariant) {
    return (
      <section
        aria-busy='true'
        aria-label='Laster produktvalg for Comfyrobe'
        className='bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8 lg:py-16'
      >
        <div className='mx-auto min-h-160 max-w-7xl rounded-3xl border border-foreground/30 bg-foreground/[0.04]' />
      </section>
    )
  }

  const klarnaPurchaseAmount =
    getKlarnaMinorUnitAmount({
      amount: selectedVariant.price.amount ?? '0',
      currencyCode: selectedVariant.price.currencyCode
    }) ?? ''

  return (
    <section
      id='kjop-comfyrobe'
      aria-labelledby='comfyrobe-heading'
      className='scroll-mt-20 bg-background text-foreground'
    >
      <KlarnaOnSiteMessagingScript />
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16'>
        <div className='grid gap-7 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-7'>
          <header className='lg:col-start-2 lg:row-start-1'>
            <div className='inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/30 bg-background px-4 py-2'>
              <ShieldCheck className='size-4' aria-hidden='true' />
              <span className='font-utekos-text-medium text-sm text-foreground'>
                Utekos Comfyrobe™
              </span>
            </div>
            <h1
              id='comfyrobe-heading'
              className='mt-5 font-sans text-4xl leading-[1.02] font-bold text-balance text-foreground sm:text-5xl lg:text-6xl'
            >
              Comfyrobe™ – varm og beskyttet når været skifter
            </h1>
            <p className='font-utekos-text-medium mt-5 max-w-2xl text-lg leading-7 text-foreground sm:text-xl sm:leading-8'>
              En vanntett og vindtett robe med lunt sherpa-fôr – for
              kjølige kvelder, camping, båt, tribune og tiden etter
              aktivitet.
            </p>
            <ul className='mt-6 grid gap-3'>
              {HERO_PROOFS.map(proof => (
                <li
                  key={proof}
                  className='font-utekos-text flex items-start gap-3 text-sm leading-6 text-foreground sm:text-base'
                >
                  <CheckCircle2
                    className='mt-0.5 size-5 shrink-0'
                    aria-hidden='true'
                  />
                  <span>{proof}</span>
                </li>
              ))}
            </ul>
          </header>

          <div className='relative aspect-4/5 overflow-hidden rounded-3xl border border-foreground/30 bg-foreground/[0.04] shadow-xl lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)]'>
            <ProductGallery
              title={productData.title}
              images={galleryImages}
            />
          </div>

          <div
            id='comfyrobe-valg'
            className='scroll-mt-24 rounded-3xl border border-foreground/30 bg-background p-5 shadow-xl sm:p-7 lg:col-start-2 lg:row-start-2'
          >
            <PriceActivityPanel
              productHandle={productData.handle}
              priceAmount={selectedVariant.price.amount ?? '0'}
              currencyCode={selectedVariant.price.currencyCode}
            />

            <div
              aria-label='Betalingsinformasjon fra Klarna'
              className='mt-4 overflow-hidden'
            >
              <KlarnaCreditPromotionAutoSize
                id='klarna-credit-promotion-comfyrobe-landing'
                purchaseAmount={klarnaPurchaseAmount}
              />
            </div>

            <article
              aria-labelledby='comfyrobe-product-options'
              className='mt-6'
            >
              <h2
                id='comfyrobe-product-options'
                className='font-sans text-xl font-bold text-foreground'
              >
                Velg din Comfyrobe™
              </h2>
              <div className='mt-5 flex flex-col gap-7'>
                {sortedProductOptions.map(option =>
                  renderOptionComponent({
                    option,
                    allVariants,
                    selectedVariant,
                    onOptionChange: updateVariant,
                    colorHexMap,
                    productHandle: productData.handle
                  })
                )}
              </div>

              <div className='mt-7'>
                <AddToCart
                  product={productData}
                  selectedVariant={selectedVariant}
                />
              </div>
            </article>

            <TrustSignals />
          </div>
        </div>
      </div>
    </section>
  )
}
