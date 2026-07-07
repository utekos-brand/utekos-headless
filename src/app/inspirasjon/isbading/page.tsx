// Path: src/app/inspirasjon/isbading/page.tsx

import type { Metadata } from 'next'

import { IceBathingHeroSection } from './sections/IceBathingHeroSection'
import { BenefitsGrid, benefitsData } from './sections/BenefitsGrid'
import { UseCasesGrid, useCasesData } from './sections/UseCasesGrid'
import { SeasonsSection } from './sections/SeasonsSection'
import { PopularSpotsGrid, popularSpotsData } from './sections/PopularSpotsGrid'
import { SocialProof } from './sections/SocialProof'
import { CTASection } from './sections/CTASection'
import Link from 'next/link'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { ProductSpotlight } from './sections/ProductSpotlight'
import { IceBathingFAQ } from './sections/IceBathingFAQ'

export const metadata: Metadata = {
  metadataBase: new URL('https://utekos.no'),
  title: 'Isbading og Utekos | Varmen du trenger etter kuldesjokket',
  description:
    'Gjør isbadingen til en komfortabel opplevelse. Fra det kalde dykket til den varme omfavnelsen etterpå – Utekos er isbaderens viktigste utstyr.',
  keywords: ['isbading', 'vinterbading', 'helårsbading', 'badekåpe isbading', 'skifteponcho', 'utekos'],
  alternates: {
    canonical: '/inspirasjon/isbading'
  },
  openGraph: {
    title: 'Comfyrobe™ | Forleng følelsen av mestring',
    description:
      'Slipp å fryse mens du skifter. Oppdag hvordan Utekos gjør overgangen fra iskaldt vann til varm bil lekende lett.',
    url: '/inspirasjon/isbading',
    siteName: 'Utekos',
    images: [
      {
        url: '/comfyrobe/comfy-isbading-1080-master.png',
        width: 1200,
        height: 630,
        alt: 'Isbader som varmer seg i Utekos-plagg etter et bad'
      }
    ],
    locale: 'no_NO',
    type: 'website'
  }
}

export default function IceBathingInspirationPage() {
  return (
    <article className='flex flex-col bg-background text-foreground'>
      <IceBathingHeroSection />
      <ProductSpotlight />

      <UseCasesGrid useCases={useCasesData} />

      <BenefitsGrid benefits={benefitsData} />

      <SeasonsSection />

      <IceBathingFAQ />

      <PopularSpotsGrid destinations={popularSpotsData} />

      <SocialProof />

      <CTASection />

      <div className='fixed right-4 bottom-4 left-4 z-50 animate-in duration-700 fade-in slide-in-from-bottom-10 md:hidden'>
        <BrandBadge
          asChild
          backgroundColor='var(--primary)'
          textColor='var(--primary-foreground)'
          className='min-h-14 w-full border border-transparent px-6 py-3 text-base leading-4 font-bold tracking-normal shadow-2xl transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0'
        >
          <Link href='/produkter/comfyrobe'>Kjøp Comfyrobe™</Link>
        </BrandBadge>
      </div>
    </article>
  )
}
