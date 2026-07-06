import { AnimatedBlock } from '@/components/AnimatedBlock'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { Sparkles } from 'lucide-react'

export interface ProductHeaderProps {
  productHandle: string
  productTitle: string
  productSubtitle: string
}

export default function ProductHeader({
  productHandle,
  productTitle,
  productSubtitle
}: ProductHeaderProps) {
  return (
    <hgroup className='text-left text-foreground md:mb-6'>
      <AnimatedBlock
        className='will-animate-fade-in-up'
        delay='0.06s'
        threshold={0.2}
      >
        {productHandle === 'utekos-special-edition' && (
          <BrandBadge
            backgroundColor='bg-card '
            textColor='text-foreground '
            className='mb-5 gap-2'
          >
            <Sparkles className='h-5 w-5' aria-hidden='true' />
            <span className='text-foreground'>
              Begrenset opplag
            </span>
          </BrandBadge>
        )}

        <h1 className='mx-0 text-left font-sans text-4xl font-bold text-foreground'>
          {productTitle}
        </h1>

        {typeof productSubtitle === 'string' &&
          productSubtitle.trim() !== '' && (
            <p className='leading-text-paragraph mt-4 max-w-2xl text-lg text-foreground'>
              {productSubtitle}
            </p>
          )}
      </AnimatedBlock>
    </hgroup>
  )
}
