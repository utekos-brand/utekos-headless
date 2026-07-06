import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import Link from 'next/link'
import { InspirationPageCards } from './Sections/InspirationHeroSection'

export const metadata = {
  metadataBase: new URL('https://utekos.no'),
  title:
    'Inspirasjon til hytteliv, bobil, båtliv og utekos | Utekos',
  description:
    'Finn inspirasjon til mer komfort ute: hytteliv, bobil, båtliv, terrasse, grillkvelder, isbading og camping med Utekos.',
  alternates: { canonical: '/inspirasjon' },
  openGraph: {
    title: 'Inspirasjon til mer utekos | Utekos',
    description:
      'Utforsk guider og ideer for hytteliv, bobil, båtliv, terrasse, grillkvelder, isbading og camping.',
    url: '/inspirasjon',
    siteName: 'Utekos',
    locale: 'no_NO',
    type: 'website'
  }
}

export default function InspirationPage() {
  return (
    <article className='overflow-x-clip bg-background text-foreground'>
      <div className='container mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20'>
        <UtekosBreadcrumbBar
          embedded
          surface='transparent'
          className='mb-8'
          items={[
            { label: 'Forsiden', href: '/' },
            { label: 'Inspirasjon' }
          ]}
        />
        <div className='text-center'>
          <h1 className='mx-auto max-w-3xl text-4xl leading-tight font-bold text-balance sm:text-5xl lg:text-6xl'>
            Inspirasjon for mer utekos
          </h1>
          <p className='mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/90'>
            Utforsk praktiske guider for hytteliv, bobil, båtliv,
            terrasse, grillkvelder, isbading og camping. Finn
            situasjonen som ligner din, og se hvordan Utekos
            forlenger de gode øyeblikkene ute.
          </p>
          <div className='mt-8 flex flex-wrap justify-center gap-4'>
            <BrandBadge
              asChild
              backgroundColor='var(--primary)'
              textColor='var(--primary-foreground)'
              className='min-h-12 border border-transparent px-7 py-3 text-base leading-4 font-semibold transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
            >
              <Link href='/produkter'>Se produktene</Link>
            </BrandBadge>
            <BrandBadge
              asChild
              backgroundColor='var(--secondary)'
              textColor='var(--secondary-foreground)'
              className='min-h-12 border border-border px-7 py-3 text-base leading-4 font-semibold transition-transform duration-300 hover:-translate-y-0.5 hover:brightness-105 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
            >
              <Link href='/handlehjelp/storrelsesguide'>
                Finn riktig størrelse
              </Link>
            </BrandBadge>
          </div>
        </div>
      </div>

      <InspirationPageCards />
    </article>
  )
}
