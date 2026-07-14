import type { ProductVariantSelectorProps } from '@types'

type ProductCardCompactVariantSelectorProps = Pick<
  ProductVariantSelectorProps,
  'options' | 'selectedOptions' | 'onOptionChange'
> & { productTitle: string }

export function ProductCardCompactVariantSelector({
  options,
  selectedOptions,
  onOptionChange,
  productTitle
}: ProductCardCompactVariantSelectorProps) {
  const selectableOptions = options.filter(option => {
    const optionName = option.name.toLowerCase()

    return (
      optionName !== 'kjønn' &&
      optionName !== 'farge' &&
      optionName !== 'color' &&
      option.optionValues.length > 1
    )
  })

  if (selectableOptions.length === 0) {
    return null
  }

  return (
    <div className='dark:border-dark-card-foreground/24 flex flex-col gap-2 border-t border-card-foreground/24 p-2 md:hidden'>
      {selectableOptions.map(option => (
        <label
          key={option.name}
          className='flex flex-col gap-1 text-[0.65rem] font-semibold tracking-wide text-card-foreground uppercase'
        >
          <span>{option.name}</span>
          <select
            value={selectedOptions[option.name] ?? ''}
            onChange={event => {
              const value = event.currentTarget.value

              onOptionChange(previousOptions => ({
                ...previousOptions,
                [option.name]: value
              }))
            }}
            aria-label={`${option.name} for ${productTitle}`}
            className='h-10 w-full cursor-pointer rounded-lg border border-foreground bg-background px-2 text-xs font-semibold text-foreground focus-visible:ring-2 focus-visible:ring-foreground/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card focus-visible:outline-none'
          >
            {option.optionValues.map(value => (
              <option key={value.name} value={value.name}>
                {value.name}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}
