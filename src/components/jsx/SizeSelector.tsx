import Link from 'next/link'
import { useState } from 'react'

import { safeJsonParse } from '@/lib/utils/safeJsonParse'

import type { Dimension, SizeSelectorProps } from '@types'

export function SizeSelector({
  optionName,
  values,
  variants,
  selectedVariant,
  onSelect,
  productHandle
}: SizeSelectorProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handlesToHideGuide = ['utekos-buff', 'utekos-stapper']

  return (
    <div className='space-y-3'>
      <div className='grid grid-cols-3 gap-2 md:flex md:flex-col md:gap-3'>
        {values.map(sizeValue => {
          const representativeVariant = variants.find(v =>
            v.selectedOptions.some(
              opt =>
                opt.name === optionName &&
                opt.value === sizeValue
            )
          )

          const variantProfileRef =
            representativeVariant?.variantProfile?.reference
          const lengthJson = variantProfileRef?.length?.value
          const centerToWristJson =
            variantProfileRef?.centerToWrist?.value
          const flatWidthJson =
            variantProfileRef?.flatWidth?.value
          const length = safeJsonParse<Dimension>(
            lengthJson,
            null
          )
          const centerToWrist = safeJsonParse<Dimension>(
            centerToWristJson,
            null
          )
          const flatWidth = safeJsonParse<Dimension>(
            flatWidthJson,
            null
          )
          const isSelected =
            selectedVariant.selectedOptions.some(
              opt =>
                opt.name === optionName &&
                opt.value === sizeValue
            )

          return (
            <button
              key={sizeValue}
              type='button'
              onClick={() => onSelect(optionName, sizeValue)}
              role='radio'
              aria-checked={isSelected}
              data-selected={isSelected}
              className='border-card-foreground/24 hover:border-card-foreground/45 focus-visible:ring-card-foreground/45 data-[selected=true]:border-secondary data-[selected=true]:bg-ceramic data-[selected=true]:text-secondary data-[selected=true]:ring-secondary/55 flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-card-foreground/24 bg-card px-3 py-3 text-center text-sm text-card-foreground transition-all duration-200 ease-in-out hover:border-card-foreground/45 focus-visible:ring-2 focus-visible:ring-card-foreground/45 focus-visible:outline-none data-[selected=true]:shadow-[0_12px_28px_-22px_color-mix(in_oklch,var(--secondary)_70%,transparent)] data-[selected=true]:ring-2 md:w-full md:justify-between md:p-4 md:text-left md:text-base'
            >
              <span className='font-sans'>{sizeValue}</span>
              <div className='/72 hidden text-right text-xs text-card-foreground/72 md:block'>
                {length && (
                  <div>
                    Lengde til hals: {`${length.value} cm`}
                  </div>
                )}
                {centerToWrist && (
                  <div>
                    Senter til ermetupp:{' '}
                    {`${centerToWrist.value} cm`}
                  </div>
                )}
                {flatWidth && (
                  <div>
                    Flatmål bunn: {`${flatWidth.value} cm`}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {!handlesToHideGuide.includes(productHandle) && (
        <div className='border-card-foreground/24 flex w-full flex-col rounded-2xl border border-card-foreground/24 bg-card p-4 text-left transition-colors'>
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className='font-utekos-text-medium focus-visible:ring-card-foreground/45 flex w-full cursor-pointer justify-between p-0 text-card-foreground transition-colors focus-visible:ring-2 focus-visible:ring-card-foreground/45 focus-visible:outline-none'
            aria-expanded={isDetailsOpen}
            aria-controls='size-details'
          >
            <span className='font-utekos-text-medium'>
              Usikker på størrelsen?
            </span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className={`ring-card-foreground/45 transform rounded-full text-card-foreground ring-1 ring-card-foreground/45 transition-transform duration-200 hover:scale-105 hover:ring-2 ${isDetailsOpen ? 'rotate-45' : ''}`}
              aria-hidden='true'
            >
              <path d='M5 12h14' />
              <path d='M12 5v14' />
            </svg>
          </button>
          <div
            id='size-details'
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isDetailsOpen ? 'max-h-40 pt-3 opacity-100' : 'max-h-0 opacity-0'} `}
          >
            <p className='text-xs text-card-foreground'>
              Se dimensjonene på Utekos-modellene{' '}
              <Link
                href='/handlehjelp/storrelsesguide'
                className='/76 text-card-foreground underline hover:text-card-foreground/76'
              >
                her
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
