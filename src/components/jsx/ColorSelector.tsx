// Path: src/components/jsx/ColorSelector/ColorSelector.tsx

import { OptionButton } from '@/components/jsx/OptionButton'
import type { ColorSelectorProps } from '@types'

export function ColorSelector({
  optionName,
  values,
  variants,
  selectedVariant,
  onSelect,
  colorHexMap
}: ColorSelectorProps) {
  const selectedSize = selectedVariant.selectedOptions.find(
    opt => opt.name.toLowerCase() === 'størrelse'
  )?.value

  return (
    <div className='space-y-3'>
      {values.map(colorValue => {
        const variantForProperties = variants.find(variant => {
          const hasColor = variant.selectedOptions.some(
            opt => opt.value === colorValue
          )
          const hasSize =
            !selectedSize ||
            variant.selectedOptions.some(
              opt => opt.value === selectedSize
            )
          return hasColor && hasSize
        })

        const variantProfileRef =
          variantForProperties?.variantProfile?.reference

        const colorLabel =
          variantProfileRef?.colorLabel?.value || colorValue
        const backgroundColor =
          variantProfileRef?.backgroundColor?.value
        const swatchDotColor = colorHexMap.get(colorValue)

        const isSelected = selectedVariant.selectedOptions.some(
          opt => opt.value === colorValue
        )

        return (
          <OptionButton
            key={colorValue}
            isSelected={isSelected}
            onClick={() => onSelect(optionName, colorValue)}
          >
            <span className='font-utekos-text-medium text-foreground'>
              {colorLabel}
            </span>
            <div
              className='color-swatch-container text-foreground'
              style={
                {
                  '--swatch-bg': backgroundColor
                } as React.CSSProperties
              }
            >
              <div
                className='color-swatch-dot'
                style={
                  {
                    '--swatch-dot-color': swatchDotColor
                  } as React.CSSProperties
                }
                data-selected={isSelected}
              />
            </div>
          </OptionButton>
        )
      })}
    </div>
  )
}
