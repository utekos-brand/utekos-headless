import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import Image from 'next/image'
import Link from 'next/link'
import { Lead } from '@/components/typography/Lead'
import { compareModelsTheme } from '../utils/compareModelsTheme'

import CompareHeroImage from '@public/kate-linn-stort-bilde.webp'

export function CompareModelsPageHero() {
  return (
    <article className='relative isolate min-h-[calc(100svh-12rem)] overflow-hidden bg-background text-foreground'>
      <Image
        src={CompareHeroImage}
        alt='To personer i Utekos ute i norsk natur'
        fill
        priority
        sizes='100vw'
        className='-z-20 object-cover object-[58%_center]'
      />
      <div
        className={`absolute inset-0 -z-10 ${compareModelsTheme.heroOverlay}`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 -z-10 h-2/5 ${compareModelsTheme.heroGradient}`}
      />

      <div className='mx-auto flex min-h-[calc(100svh-12rem)] w-full max-w-7xl flex-col justify-end px-[6vw] py-10 sm:py-12 lg:py-16'>
        <div className='max-w-6xl'>
          <BrandBadge
            label='Kjøpsguide'
            tone='secondary'
            className='mb-7 px-6 py-3 text-sm shadow-[0_18px_44px_-30px_color-mix(in_oklab,var(--secondary)_80%,transparent)]'
          />
          <h1 className='font-sans text-5xl text-foreground'>
            Hvilken Utekos passer best for deg?
          </h1>
          <Lead
            Text='Sammenlign Utekos Dun, Utekos Mikrofiber og Utekos TechDown. Finn riktig modell for hytte, bobil, båt og kalde kvelder ute.'
            className={`mt-7 max-w-2xl pb-0! text-lg sm:text-2xl ${compareModelsTheme.heroTextMuted}`}
          />
          <div className='mt-9 flex flex-wrap items-center gap-4'>
            <BrandBadge
              asChild
              tone='neutral'
              className='px-7 py-4 text-base transition-transform duration-300 hover:scale-[1.02]'
            >
              <Link href='#velg-etter-bruk'>Finn modellen din</Link>
            </BrandBadge>
            <Link href='#sammenligning' className={compareModelsTheme.linkSubtle}>
              Se tabellen
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
