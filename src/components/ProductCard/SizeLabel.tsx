// Path: src/components/ProductCard/SizeLabel.tsx
'use client'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { cn } from '@/lib/utils/className'
import { ExternalLink, Ruler } from 'lucide-react'
import type { SizeLabelProps } from '@types'
import { H3 } from '@/components/typography/TypographyH3'
import { InlineText } from '@/components/typography/TypographyInlineText'
import { P } from '@/components/typography/TypographyP'

export function SizeLabel({ className = '' }: SizeLabelProps) {
  return (
    <HoverCard>
      <HoverCardTrigger
        href='/handlehjelp/storrelsesguide'
        target='_blank'
        rel='noopener noreferrer'
        className={cn(
          'font-utekos-text-medium dark:hover:text-dark-card-foreground/90 dark:focus-visible:outline-dark-card-foreground inline-flex items-center gap-1 text-sm tracking-wide text-card-foreground uppercase hover:text-card-foreground/90 hover:transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card-foreground',
          className
        )}
      >
        <InlineText>STØRRELSE</InlineText>
        <ExternalLink className='font-utekos-text-medium size-3 text-current' />
      </HoverCardTrigger>
      <HoverCardContent
        className=' w-60 border-border'
        side='top'
        align='start'
      >
        <div className='flex items-start space-x-3'>
          <Ruler className='dark:text-dark-popover-foreground mt-1 size-7 text-popover-foreground' />
          <div className='space-y-1'>
            <H3 className='dark:text-dark-popover-foreground pb-0 text-sm font-semibold text-popover-foreground'>
              Usikker på størrelsen?
            </H3>
            <P className='dark:text-dark-popover-foreground/90 text-sm text-popover-foreground/90 not-first:mt-0'>
              Klikk for å åpne vår størrelsesguide i en ny fane.
            </P>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
