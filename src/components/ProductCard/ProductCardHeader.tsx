import { CardHeader, CardTitle } from '@/components/ui/card'
import type { ProductCardHeaderProps } from '@types'
import { cn } from '@/lib/utils/className'
import Link from 'next/link'
import { ProductColorSwatches } from './ProductColorSwatches'
import { ProductVariantSelector } from './ProductVariantSelector'
import { H3 } from '@/components/typography/TypographyH3'

type ProductCardHeaderViewProps = ProductCardHeaderProps & {
  compactMobile?: boolean
}

export function ProductCardHeader({
  title,
  options,
  colorHexMap,
  selectedOptions,
  onOptionChange,
  productUrl,
  onViewProduct,
  compactMobile = false
}: ProductCardHeaderViewProps) {
  const colorOption = options.find(
    option => option.name.toLowerCase() === 'farge'
  )
  const optionsWithoutColor = options.filter(
    option => option.name.toLowerCase() !== 'farge'
  )
  const productViewClickProps =
    onViewProduct ? { onClick: onViewProduct } : {}

  return (
    <CardHeader
      className={cn(
        ' grow border-t border-border p-6 pb-4',
        compactMobile && 'p-2 pb-2 md:p-6 md:pb-4'
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-start justify-between gap-4',
          compactMobile &&
            'mb-2 flex-col gap-1.5 md:mb-4 md:flex-row md:gap-4'
        )}
      >
        <Link
          href={productUrl}
          {...productViewClickProps}
          className={cn(
            'font-utekos-text-medium focus-visible:outline-card-foreground min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card-foreground',
            compactMobile && 'w-full md:w-auto'
          )}
        >
          <CardTitle
            className={cn(
              'text-card-foreground',
              compactMobile &&
                'text-card-foreground'
            )}
          >
            <H3
              className={cn(
                'line-clamp-2 pb-0 text-xl font-semibold text-balance text-card-foreground',
                compactMobile &&
                  'text-[0.82rem] leading-tight md:text-xl md:leading-normal'
              )}
            >
              {title}
            </H3>
          </CardTitle>
        </Link>

        {colorOption && (
          <ProductColorSwatches
            colorOption={colorOption}
            colorHexMap={colorHexMap}
            selectedOptions={selectedOptions}
            onOptionChange={onOptionChange}
            {...(compactMobile ?
              {
                className:
                  'max-w-full justify-start gap-1 pt-0 md:max-w-[46%] md:justify-end md:gap-2 md:pt-1',
                swatchClassName: '!size-5 md:!size-8'
              }
            : {})}
          />
        )}
      </div>
      <ProductVariantSelector
        options={optionsWithoutColor}
        colorHexMap={colorHexMap}
        selectedOptions={selectedOptions}
        onOptionChange={onOptionChange}
        compactMobile={compactMobile}
      />
    </CardHeader>
  )
}
