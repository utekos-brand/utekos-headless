'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { useAnalytics } from '@/hooks/useAnalytics'

/**
 * Isbading-heroens primær-CTA. Isolert som klient-komponent slik at selve
 * hero-seksjonen kan forbli en Server Component. Sporer interaksjon og
 * scroller til produkt-spotlight.
 */
export function IceBathingHeroCta() {
  const { trackEvent } = useAnalytics()

  return (
    <BrandBadge
      asChild
      backgroundColor='var(--primary)'
      textColor='var(--primary-foreground)'
      className='group min-h-14 min-w-[200px] border border-transparent px-8 py-4 text-base leading-4 font-bold tracking-normal shadow-2xl transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0'
    >
      <Link
        href='#product-spotlight'
        onClick={e => {
          e.preventDefault()
          trackEvent('HeroInteract', {
            content_name: 'Scroll to Product Spotlight',
            content_category: 'Hero Section'
          })

          const element = document.getElementById('product-spotlight')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }}
        className='inline-flex items-center justify-center'
      >
        Kle deg for kulden
        <ArrowRight
          className='ml-2 size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0'
          aria-hidden
        />
      </Link>
    </BrandBadge>
  )
}
