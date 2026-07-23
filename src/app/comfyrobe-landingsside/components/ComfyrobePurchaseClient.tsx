'use client'

import { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Ruler, ShoppingBag } from 'lucide-react'
import { AddToCart } from '@/components/cart/AddToCart'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { KlarnaLandingExpressCheckout } from '@/app/skreddersy-varmen/components/KlarnaLandingExpressCheckout'
import { useVariantState } from '@/hooks/useVariantState'
import { flattenVariants } from '@/lib/utils/flattenVariants'
import { reportCanonicalViewItem } from '@/lib/analytics/viewItemReporter'
import { createViewItemReportKey } from '@/lib/analytics/viewItemReportKey'
import type { ShopifyProduct, ShopifyProductVariant } from 'types/product'

function formatMoney(amount: string | number, currencyCode: string) {
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount)) return ''

  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(numericAmount)
}

function getSavings(variant: ShopifyProductVariant) {
  const price = Number(variant.price.amount)
  const compareAtPrice = Number(variant.compareAtPrice?.amount)

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(compareAtPrice) ||
    compareAtPrice <= price
  ) {
    return null
  }

  return {
    amount: compareAtPrice - price,
    percentage: Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }
}

function hasOptionValue(
  variant: ShopifyProductVariant,
  optionName: string,
  value: string
) {
  return variant.selectedOptions.some(
    option => option.name === optionName && option.value === value
  )
}

export function ComfyrobePurchaseClient({
  product
}: {
  product: ShopifyProduct
}) {
  const variants = useMemo(() => flattenVariants(product), [product])
  const initialAvailableVariant = useMemo(
    () => variants.find(variant => variant.availableForSale) ?? variants[0] ?? null,
    [variants]
  )
  const { variantState, updateVariant, allVariants } = useVariantState(
    product,
    false,
    initialAvailableVariant?.id ?? null
  )
  const reportedViewItemKey = useRef<string | null>(null)
  const selectedVariant =
    variantState.status === 'selected' ? variantState.variant : initialAvailableVariant

  useEffect(() => {
    if (!selectedVariant) return

    const reportKey = createViewItemReportKey(product.id, selectedVariant.id)
    if (reportedViewItemKey.current === reportKey) return

    return reportCanonicalViewItem({
      product,
      variant: selectedVariant,
      onEmitted: () => {
        reportedViewItemKey.current = reportKey
      }
    })
  }, [product, selectedVariant])

  if (!selectedVariant) {
    return (
      <section className='bg-foreground px-6 py-20 text-background dark:bg-dark-foreground dark:text-dark-background'>
        <div className='mx-auto max-w-3xl text-center'>
          <h2 className='font-sans text-3xl font-bold'>Comfyrobe™ er midlertidig utsolgt</h2>
          <p className='mt-4 font-utekos-text text-background/80 dark:text-dark-background/80'>
            Produktet kan ikke bestilles før Shopify rapporterer en tilgjengelig variant.
          </p>
        </div>
      </section>
    )
  }

  const sizeOption = product.options.find(option => option.name === 'Størrelse')
  const color = selectedVariant.selectedOptions.find(option => option.name === 'Farge')?.value
  const gender = selectedVariant.selectedOptions.find(option => option.name === 'Kjønn')?.value
  const savings = getSavings(selectedVariant)
  const heroImage =
    selectedVariant.image?.url ??
    product.featuredImage?.url ??
    product.images.edges[0]?.node.image.url ??
    'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Kvinne-1600x1600.png?v=1784824903'

  return (
    <section aria-labelledby='purchase-heading' className='w-full bg-foreground text-background dark:bg-dark-foreground dark:text-dark-background'>
      <div className='grid min-h-[760px] lg:grid-cols-2'>
        <div className='relative min-h-[520px] overflow-hidden bg-background dark:bg-dark-background lg:min-h-full'>
          <Image
            src={heroImage}
            alt={product.featuredImage?.altText || 'Comfyrobe produktbilde'}
            fill
            sizes='(max-width: 1023px) 100vw, 50vw'
            className='object-contain p-6 md:p-12'
          />
        </div>

        <div className='flex flex-col'>
          <div className='flex-1 px-6 py-14 md:px-12 lg:px-16 lg:py-20'>
            <p className='font-utekos-text-medium text-primary dark:text-dark-primary'>Velg din Comfyrobe™</p>
            <h2 id='purchase-heading' className='mt-3 font-sans text-5xl leading-[0.92] font-bold tracking-[-0.02em] md:text-6xl'>
              Tøff ute. Myk inne.
            </h2>
            <p className='mt-6 max-w-xl font-utekos-text text-lg leading-relaxed text-background/80 dark:text-dark-background/80'>
              Velg en tilgjengelig størrelse og fullfør kjøpet med vanlig handlekurv eller Klarna Express Checkout.
            </p>

            <div className='mt-8 flex flex-wrap items-end gap-x-4 gap-y-2'>
              <span className='font-sans text-5xl font-bold tabular-nums'>
                {formatMoney(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
              </span>
              {savings && selectedVariant.compareAtPrice ? (
                <>
                  <span className='pb-1 text-lg text-background/60 line-through dark:text-dark-background/60'>
                    {formatMoney(selectedVariant.compareAtPrice.amount, selectedVariant.compareAtPrice.currencyCode)}
                  </span>
                  <BrandBadge tone='promo' className='mb-1 h-8 px-3 py-0 text-xs font-bold'>
                    Spar {formatMoney(savings.amount, selectedVariant.price.currencyCode)} · {savings.percentage}%
                  </BrandBadge>
                </>
              ) : null}
            </div>

            <div className='mt-10 grid gap-4 sm:grid-cols-2'>
              {color ? (
                <div className='rounded-2xl border border-background/15 p-4 dark:border-dark-background/15'>
                  <span className='block text-xs text-background/60 dark:text-dark-background/60'>Farge</span>
                  <span className='mt-1 block font-utekos-text-medium'>{color}</span>
                </div>
              ) : null}
              {gender ? (
                <div className='rounded-2xl border border-background/15 p-4 dark:border-dark-background/15'>
                  <span className='block text-xs text-background/60 dark:text-dark-background/60'>Passform</span>
                  <span className='mt-1 block font-utekos-text-medium'>{gender}</span>
                </div>
              ) : null}
            </div>

            {sizeOption ? (
              <fieldset className='mt-10'>
                <div className='flex items-center justify-between gap-4'>
                  <legend className='font-utekos-text-medium'>Størrelse</legend>
                  <Link href='/handlehjelp/storrelsesguide' className='inline-flex items-center gap-2 text-sm underline underline-offset-4'>
                    <Ruler className='size-4' aria-hidden /> Se størrelsesguide
                  </Link>
                </div>
                <div className='mt-4 grid grid-cols-3 gap-3' role='radiogroup' aria-label='Velg størrelse'>
                  {sizeOption.optionValues.map(optionValue => {
                    const value = optionValue.name
                    const matchingVariants = allVariants.filter(variant =>
                      hasOptionValue(variant, sizeOption.name, value)
                    )
                    const available = matchingVariants.some(variant => variant.availableForSale)
                    const selected = hasOptionValue(selectedVariant, sizeOption.name, value)

                    return (
                      <button
                        key={value}
                        type='button'
                        role='radio'
                        aria-checked={selected}
                        aria-disabled={!available}
                        disabled={!available}
                        onClick={() => available && updateVariant(sizeOption.name, value)}
                        className={[
                          'relative min-h-14 rounded-2xl border px-3 py-3 text-center font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
                          selected ? 'border-background bg-background text-foreground dark:border-dark-background dark:bg-dark-background dark:text-dark-foreground' : 'border-background/20 text-background dark:border-dark-background/20 dark:text-dark-background',
                          available ? 'hover:border-primary' : 'cursor-not-allowed opacity-45'
                        ].join(' ')}
                      >
                        <span className='flex items-center justify-center gap-2'>
                          {value}
                          {selected ? <Check className='size-4' aria-hidden /> : null}
                        </span>
                        {!available ? <span className='mt-1 block text-[10px] uppercase tracking-wide'>Utsolgt</span> : null}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            <div className='mt-10 rounded-2xl border border-background/12 bg-background/5 p-5 dark:border-dark-background/12 dark:bg-dark-background/5'>
              <ul className='grid gap-3 text-sm sm:grid-cols-2'>
                <li className='flex items-center gap-2'><Check className='size-4 text-primary' aria-hidden /> 8 000 mm vannsøyle</li>
                <li className='flex items-center gap-2'><Check className='size-4 text-primary' aria-hidden /> Mykt SherpaCore™-fôr</li>
                <li className='flex items-center gap-2'><Check className='size-4 text-primary' aria-hidden /> Toveis YKK®-glidelås</li>
                <li className='flex items-center gap-2'><Check className='size-4 text-primary' aria-hidden /> Romslig unisex-passform</li>
              </ul>
            </div>
          </div>

          <div className='border-t border-background/15 bg-card p-6 text-card-foreground md:p-10'>
            {selectedVariant.availableForSale ? (
              <div className='space-y-4'>
                <AddToCart product={product} selectedVariant={selectedVariant} />
                <KlarnaLandingExpressCheckout
                  product={product}
                  selectedVariant={selectedVariant}
                  quantity={1}
                />
              </div>
            ) : (
              <div className='rounded-2xl border border-border p-5 text-center'>
                <ShoppingBag className='mx-auto size-6' aria-hidden />
                <p className='mt-3 font-semibold'>Valgt størrelse er utsolgt</p>
              </div>
            )}
            <p className='mt-5 text-center text-sm text-card-foreground/70'>Rask levering · Sikker betaling · 14 dagers retur</p>
          </div>
        </div>
      </div>
    </section>
  )
}
