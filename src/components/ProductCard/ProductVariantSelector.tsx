// Path: src/components/ProductCard/ProductVariantSelector.tsx

import { SizeLabel } from '@/components/ProductCard/SizeLabel'
import { variantSwatchButtonClassName } from '@/components/ProductCard/ProductColorSwatches'
import type { ProductVariantSelectorProps } from '@types'
import { cn } from '@/lib/utils/className'
import { InlineText } from '@/components/typography/TypographyInlineText'

type ProductVariantSelectorViewProps =
  ProductVariantSelectorProps & { compactMobile?: boolean }

const sizeOptionClassName =
  'btn-variant-option inline-flex hover:cursor-pointer min-h-9 items-center justify-center rounded-lg px-3 py-1.5 text-sm leading-none font-medium whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-border dark:focus-visible:ring-dark-border focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-offset-dark-primary focus-visible:outline-none'

const selectedSizeOptionClassName =
  'border-primary dark:border-dark-primary bg-background dark:bg-dark-background text-foreground '

const unselectedSizeOptionClassName =
  'border-border  bg-card  text-card-foreground  hover:cursor-pointer hover:bg-card-hover dark:hover:bg-dark-card-hover'

export function ProductVariantSelector({
  options,
  selectedOptions,
  onOptionChange,
  colorHexMap,
  compactMobile = false
}: ProductVariantSelectorViewProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        compactMobile && 'gap-2 md:gap-4'
      )}
    >
      {options
        .filter(option => option.name.toLowerCase() !== 'kjønn')
        .map(option => (
          <div key={option.name}>
            {option.name.toLowerCase() === 'størrelse' ?
              <SizeLabel
                {...(compactMobile ?
                  {
                    className:
                      'text-card-foreground  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card-foreground dark:focus-visible:outline-dark-card-foreground !text-[0.68rem] md:!text-sm'
                  }
                : {
                    className:
                      'text-card-foreground  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card-foreground dark:focus-visible:outline-dark-card-foreground'
                  })}
              />
            : <InlineText
                className={cn(
                  '! mb-2 font-sans text-sm font-semibold tracking-wide text-card-foreground! uppercase',
                  compactMobile && 'text-[0.68rem] md:text-sm'
                )}
              >
                {option.name}
              </InlineText>
            }
            <div
              className={cn(
                'mt-2 flex flex-wrap items-center gap-2',
                compactMobile && 'mt-1 gap-1 md:mt-2 md:gap-2'
              )}
            >
              {option.name.toLowerCase() === 'farge' ?
                option.optionValues.map(value => {
                  const colorCode = colorHexMap.get(value.name)
                  if (!colorCode) return null

                  return (
                    <button
                      key={value.name}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        onOptionChange(prev => ({
                          ...prev,
                          [option.name]: value.name
                        }))
                      }}
                      className={cn(
                        variantSwatchButtonClassName,
                        selectedOptions[option.name] === value.name ?
                          'border-coral-green ring-coral-green ring-1'
                        : 'border-card-foreground/24 hover:border-card-foreground/45 hover:ring-2 hover:ring-card-foreground/24 dark:border-dark-card-foreground/24 dark:hover:border-dark-card-foreground/45 dark:hover:ring-dark-card-foreground/24'
                      )}
                      style={{
                        backgroundColor: colorCode ?? undefined
                      }}
                      title={value.name}
                    />
                  )
                })
              : option.optionValues.map(value => (
                  <button
                    type='button'
                    aria-pressed={
                      selectedOptions[option.name] === value.name
                    }
                    key={value.name}
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      onOptionChange(prev => ({
                        ...prev,
                        [option.name]: value.name
                      }))
                    }}
                    className={cn(
                      sizeOptionClassName,
                      compactMobile &&
                        'min-h-8 rounded-md px-2 py-1 text-xs md:min-h-9 md:rounded-lg md:px-3 md:py-1.5 md:text-sm',
                      (
                        selectedOptions[option.name] ===
                          value.name
                      ) ?
                        selectedSizeOptionClassName
                      : unselectedSizeOptionClassName
                    )}
                  >
                    <InlineText>{value.name}</InlineText>
                  </button>
                ))
              }
            </div>
          </div>
        ))}
    </div>
  )
}
