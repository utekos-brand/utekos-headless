'use client'
// Path: src/components/ProductCard/ProductCardFooter.tsx
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ProductCardFooterProps } from '@types'
import { cn } from '@/lib/utils/className'
import Link from 'next/link'
import type React from 'react'
import { ProductCardSoldOut } from './ProductCardSoldOut'
import { InlineText } from '@/components/typography/TypographyInlineText'

type ProductCardFooterViewProps = ProductCardFooterProps & {
  compactMobile?: boolean
}

export function ProductCardFooter({
  price,
  productUrl,
  isAvailable,
  isPending,
  onQuickBuy,
  onViewProduct,
  compactMobile = false
}: ProductCardFooterViewProps) {
  const handleQuickBuyClick = (e: React.MouseEvent) => {
    onQuickBuy(e)
  }

  const productViewClickProps =
    onViewProduct ? { onClick: onViewProduct } : {}
  const actionButtonClassName = cn(
    'font-utekos-text-medium h-auto min-h-12 w-full rounded-full px-8 py-4 text-lg transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2',
    compactMobile &&
      'min-h-10 px-2 py-2 text-center text-[0.68rem] leading-tight whitespace-normal md:min-h-12 md:px-8 md:py-4 md:text-lg md:leading-[1.35] md:whitespace-nowrap'
  )
  const viewProductButtonClassName = cn(
    actionButtonClassName,
    'min-h-14 px-10 text-xl',
    compactMobile &&
      'min-h-11 px-3 text-sm md:min-h-14 md:px-10 md:text-xl'
  )

  return (
    <CardFooter
      className={cn(
        'mt-auto flex flex-col gap-4 p-6 pt-0',
        compactMobile && 'gap-2 p-2 pt-0 md:gap-4 md:p-6 md:pt-0'
      )}
    >
      <div className='flex w-full items-center justify-between'>
        <InlineText
          className={cn(
            'text-2xl font-bold text-card-foreground',
            compactMobile &&
              'text-base leading-tight md:text-2xl'
          )}
        >
          {price}
        </InlineText>
      </div>
      <div
        className={cn(
          'grid w-full grid-rows-2 gap-3',
          compactMobile && 'gap-2 md:gap-3'
        )}
      >
        <Button
          asChild
          variant='seeProduct'
          className={cn(
            viewProductButtonClassName,
            'dark:focus-visible:outline-dark-foreground focus-visible:outline-foreground'
          )}
        >
          <Link
            href={productUrl}
            data-track='ProductCardFooterViewMoreClick'
            {...productViewClickProps}
            aria-label='Se produkt'
            className='min-w-0 flex-1'
          >
            <InlineText>Se produkt</InlineText>
          </Link>
        </Button>
        {isAvailable ?
          <Button
            type='button'
            onClick={handleQuickBuyClick}
            data-track='ProductCardFooterAddToCartClick'
            disabled={isPending}
            variant='checkout'
            className={cn(
              actionButtonClassName,
              'border-commerce-primary dark:border-dark-commerce-primary focus-visible:outline-commerce-primary-foreground dark:focus-visible:outline-dark-commerce-primary-foreground border disabled:opacity-70'
            )}
          >
            {isPending ?
              <Loader2 className='size-4 animate-spin' />
            : <InlineText>Legg i handlekurv</InlineText>}
          </Button>
        : <ProductCardSoldOut />}
      </div>
    </CardFooter>
  )
}
