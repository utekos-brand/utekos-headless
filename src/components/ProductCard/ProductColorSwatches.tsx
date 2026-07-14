import type { Dispatch, SetStateAction } from 'react'
import type { ShopifyProduct } from 'types/product'
import { cn } from '@/lib/utils/className'

export const variantSwatchButtonClassName =
  'size-8 shrink-0 overflow-hidden rounded-full border transition-all duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2'

interface ProductColorSwatchesProps {
  colorOption: ShopifyProduct['options'][number]
  colorHexMap: Map<string, string>
  selectedOptions: Record<string, string>
  onOptionChange: Dispatch<
    SetStateAction<Record<string, string>>
  >
  className?: string
  swatchClassName?: string
}

export function ProductColorSwatches({
  colorOption,
  colorHexMap,
  selectedOptions,
  onOptionChange,
  className,
  swatchClassName
}: ProductColorSwatchesProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-nowrap items-center justify-end gap-2',
        className
      )}
      aria-label='Velg farge'
    >
      {colorOption.optionValues.map(value => {
        const colorCode = colorHexMap.get(value.name)
        if (!colorCode) return null

        const isSelected =
          selectedOptions[colorOption.name] === value.name

        return (
          <button
            key={value.name}
            type='button'
            onClick={event => {
              event.preventDefault()
              event.stopPropagation()
              onOptionChange(prev => ({
                ...prev,
                [colorOption.name]: value.name
              }))
            }}
            className={cn(
              variantSwatchButtonClassName,
              isSelected ?
                'border-card-foreground ring-2 ring-card-foreground ring-offset-1 ring-offset-card'
              : 'border-card-foreground/70 hover:border-card-foreground hover:ring-2 hover:ring-card-foreground/70',
              swatchClassName
            )}
            style={{
              backgroundColor: colorCode,
              outlineColor: 'var(--card-foreground)'
            }}
            title={value.name}
            aria-label={`Velg farge ${value.name}`}
            aria-pressed={isSelected}
          />
        )
      })}
    </div>
  )
}
