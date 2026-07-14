'use client'
// Path: src/components/ProductCard/ProductCardFooter.tsx
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ProductCardFooterProps } from '@types'
import { cn } from '@/lib/utils/className'
import type React from 'react'
import { ProductCardSoldOut } from './ProductCardSoldOut'
import { InlineText } from '@/components/typography/TypographyInlineText'

type ProductCardFooterViewProps = ProductCardFooterProps & {
  compactMobile?: boolean
}

export function ProductCardFooter({
  price,
  isAvailable,
  isPending,
  onQuickBuy,
  compactMobile = false
}: ProductCardFooterViewProps) {
  const handleQuickBuyClick = (e: React.MouseEvent) => {
    onQuickBuy(e)
  }

  const actionButtonClassName = cn(
    'font-utekos-text-medium h-[50px] min-h-[50px] w-full rounded-full px-8 py-0 text-lg ring-1 ring-card-foreground/50 transition-transform duration-200 ring-inset hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2',
    compactMobile &&
      'px-3 text-center text-sm leading-tight whitespace-normal md:px-8 md:text-lg md:leading-[1.35] md:whitespace-nowrap'
  )
  return (
    <CardFooter className='flex w-full flex-col gap-4 p-0'>
      <div
        className={cn(
          'flex w-full items-center justify-between',
          compactMobile && 'max-md:hidden'
        )}
      >
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
      <div className='grid w-full'>
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
