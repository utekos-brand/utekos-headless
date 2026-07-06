// Path: src/app/handlehjelp/teknologi-materialer/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  Coffee,
  Move,
  Maximize2,
  ShoppingBag,
  BookOpen
} from 'lucide-react'
import { ProductSpecsView } from './components/ProductSpecsView'
import { technologyGroups } from './config'
import { TechHero } from './components/TechHero'
import { ProductSpecPageHeader } from './components/ProductSpecPageHeader'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'

export const metadata: Metadata = {
  title: 'Teknologi og materialer',
  description: 'Utforsk teknologien bak Utekos',
  keywords: [
    'Utekos teknologi',
    'TechDown',
    'varmedress',
    'SherpaCore',
    'Vannsøyle 8000mm',
    'Varmeklær teknologi',
    'yttertøy',
    'vinterdress',
    '3-i-1 design'
  ],
  alternates: { canonical: '/handlehjelp/teknologi-materialer' },
  openGraph: {
    title:
      'Teknologi & Materialer | Vitenskapen bak din komfort',
    description:
      'Lær om de unike materialene som gjør Utekos til det ultimate valget for nordisk vær. Se hvordan TechDown™ og HydroGuard™ fungerer.',
    url: '/handlehjelp/teknologi-materialer',
    siteName: 'Utekos',
    locale: 'no_NO',
    type: 'article',
    images: [
      {
        url: 'https://utekos.no/og-kate-linn-kikkert-master.png', // Sørg for at denne stien stemmer
        width: 1200,
        height: 630,
        alt: 'Nærbilde av Utekos tekniske materialer og lag-på-lag konstruksjon.'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teknologi og materialer',
    description:
      'Oppdag teknologien som holder deg varm. TechDown™, HydroGuard™ og mer.',
    images: ['https://utekos.no/og-kate-linn-kikkert-master.png'] // Samme bilde som OG
  }
}

export default function ProductSpecsPage() {
  return (
    <article className='dark:bg-dark-sidebar dark:text-dark-sidebar-foreground bg-sidebar text-sidebar-foreground'>
      {/* 1. HERO SEKSJON */}
      <TechHero />

      {/* 2. DE 3 MODUSENE (GRID) - Oppgradert design */}
      <article className='relative z-20 container mx-auto -mt-20 px-4 pb-24'>
        <div className='grid gap-6 md:grid-cols-3'>
          {/* MODUS 1 */}
          <div className='group dark:border-dark-card-foreground/10  dark:ring-dark-card-foreground/12 dark:hover:border-dark-sidebar-foreground/30 dark:hover:bg-dark-sidebar dark:hover:text-dark-sidebar-foreground dark:hover:shadow-dark-sidebar-foreground/20 relative overflow-hidden rounded-3xl border border-card-foreground/10 bg-card p-8 text-card-foreground ring-1 ring-card-foreground/12 backdrop-blur-xl transition-all duration-500 hover:border-sidebar-foreground/30 hover:bg-sidebar hover:text-sidebar-foreground hover:shadow-2xl hover:shadow-sidebar-foreground/20'>
            <div className='from-ancient-water/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

            <div className='relative z-10'>
              <div className='-foreground/10 dark:ring-dark-card-foreground/10 dark:group-hover:bg-dark-sidebar-foreground dark:group-hover:text-dark-sidebar mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card-foreground/10 text-card-foreground ring-1 ring-card-foreground/10 transition-colors group-hover:bg-sidebar-foreground group-hover:text-sidebar'>
                <Maximize2 className='h-6 w-6' />
              </div>
              <h3 className='dark:group-hover:text-dark-sidebar-foreground mb-2 text-xl font-bold text-card-foreground group-hover:text-sidebar-foreground'>
                1. Fullengdemodus
              </h3>
              <p className='dark:group-hover:text-dark-sidebar-foreground mb-4 pb-2 text-xl font-bold text-card-foreground group-hover:text-sidebar-foreground md:text-2xl'>
                Maksimal isolasjon
              </p>
              <p className='leading-text-paragraph font-utekos-text! dark:group-hover:text-dark-sidebar-foreground mt-2 tracking-wide text-card-foreground group-hover:text-sidebar-foreground md:text-xl!'>
                Utgangspunktet for selve utekosen. Plagget henger
                i full lengde som en isolerende kokong. Perfekt
                for solveggen, hengekøyen eller lange kvelder på
                terrassen.
              </p>
            </div>
          </div>

          {/* MODUS 2 */}
          <div className='group dark:border-dark-card-foreground/10 dark:ring-dark-card-foreground/12 dark:hover:border-dark-sidebar-foreground/30 dark:hover:bg-dark-sidebar dark:hover:text-dark-sidebar-foreground dark:hover:shadow-dark-sidebar-foreground/20 relative overflow-hidden rounded-3xl border border-card-foreground/10 bg-card p-8 text-card-foreground ring-1 ring-card-foreground/12 backdrop-blur-xl transition-all duration-500 hover:border-sidebar-foreground/30 hover:bg-sidebar hover:text-sidebar-foreground hover:shadow-2xl hover:shadow-sidebar-foreground/20'>
            <div className='from-very-peri/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

            <div className='relative z-10'>
              <div className='-foreground/10 dark:ring-dark-card-foreground/10 dark:group-hover:bg-dark-sidebar-foreground dark:group-hover:text-dark-sidebar mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card-foreground/10 text-card-foreground ring-1 ring-card-foreground/10 transition-colors group-hover:bg-sidebar-foreground group-hover:text-sidebar'>
                <Coffee className='h-6 w-6' />
              </div>
              <h3 className='dark:group-hover:text-dark-sidebar-foreground mb-2 font-sans text-xl font-bold text-card-foreground group-hover:text-sidebar-foreground'>
                2. Oppjustert modus
              </h3>
              <p className='dark:group-hover:text-dark-sidebar-foreground mb-4 text-sm font-bold tracking-wider text-card-foreground group-hover:text-sidebar-foreground'>
                Umiddelbar mobilitet
              </p>
              <p className='dark:group-hover:text-dark-sidebar-foreground text-card-foreground group-hover:text-sidebar-foreground'>
                Nyter du total omfavnelse av Utekos, men må
                plutselig på kjøkkenet eller svare telefonen?
                Heis opp plagget til ønsket lengde, stram snoren
                i livet og bli mobil på sekunder. Beveg deg trygt
                og subbefritt – uten å miste varmen.
              </p>
            </div>
          </div>

          {/* MODUS 3 */}
          <div className='group dark:border-dark-card-foreground/10  dark:ring-dark-card-foreground/12 dark:hover:border-dark-sidebar-foreground/30 dark:hover:bg-dark-sidebar dark:hover:text-dark-sidebar-foreground dark:hover:shadow-dark-sidebar-foreground/20 relative overflow-hidden rounded-3xl border border-card-foreground/10 bg-card p-8 text-card-foreground ring-1 ring-card-foreground/12 backdrop-blur-xl transition-all duration-500 hover:border-sidebar-foreground/30 hover:bg-sidebar hover:text-sidebar-foreground hover:shadow-2xl hover:shadow-sidebar-foreground/20'>
            <div className='from-cloud-dancer/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

            <div className='relative z-10'>
              <div className='-foreground/10 dark:ring-dark-card-foreground/10 dark:group-hover:bg-dark-sidebar-foreground dark:group-hover:text-dark-sidebar mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card-foreground/10 text-card-foreground ring-1 ring-card-foreground/10 transition-colors group-hover:bg-sidebar-foreground group-hover:text-sidebar'>
                <Move className='h-6 w-6' />
              </div>
              <h3 className='dark:group-hover:text-dark-sidebar-foreground mb-2 font-sans text-xl font-bold text-card-foreground group-hover:text-sidebar-foreground'>
                3. Parkasmodus
              </h3>
              <p className='dark:group-hover:text-dark-sidebar-foreground mb-4 text-sm font-bold tracking-wider text-card-foreground group-hover:text-sidebar-foreground'>
                Aktiv utendørs
              </p>
              <p className='dark:group-hover:text-dark-sidebar-foreground text-card-foreground group-hover:text-sidebar-foreground'>
                For turer og lengre avstander. Brett nedre del
                innunder seg og stram til for å forvandle Utekos
                til en stilig parkas. Full bevegelsesfrihet med
                et elegant snitt.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* 3. TEKNISK DYPDYKK */}
      <article className='container mx-auto px-4'>
        <Suspense>
          <ProductSpecPageHeader />
        </Suspense>

        <Suspense>
          <ProductSpecsView
            technologyGroups={technologyGroups}
          />
        </Suspense>
      </article>

      {/* 4. NAVIGASJON / CTA */}
      <article className='dark:border-dark-sidebar-foreground/10 dark:bg-dark-sidebar dark:text-dark-sidebar-foreground mt-32 border-t border-sidebar-foreground/10 bg-sidebar py-24 text-sidebar-foreground'>
        <div className='container mx-auto px-4'>
          <div className='grid gap-8 md:grid-cols-2'>
            {/* PRODUKTER */}
            <Link
              href='/produkter'
              className='group dark:border-dark-sidebar-foreground/10 dark:bg-dark-sidebar dark:text-dark-sidebar-foreground dark:hover:border-dark-sidebar-foreground/50 dark:hover:bg-dark-card dark:hover:text-dark-card-foreground relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-foreground/10 bg-sidebar p-12 text-center text-sidebar-foreground transition-all duration-500 hover:border-sidebar-foreground/50 hover:bg-card hover:text-card-foreground hover:shadow-2xl'
            >
              <div className='dark:bg-dark-sidebar-foreground dark:text-dark-sidebar dark:group-hover:bg-dark-card-foreground dark:group-hover:text-dark-card mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-foreground text-sidebar transition-all group-hover:scale-110 group-hover:bg-card-foreground group-hover:text-card'>
                <ShoppingBag className='h-8 w-8' />
              </div>
              <h3 className='dark:text-dark-sidebar-foreground dark:group-hover:text-dark-card-foreground mb-2 font-sans text-2xl font-bold text-sidebar-foreground group-hover:text-card-foreground'>
                Utforsk kolleksjonen
              </h3>
              <p className='dark:text-dark-sidebar-foreground/90 dark:group-hover:text-dark-card-foreground mb-8 max-w-sm text-sidebar-foreground/90 group-hover:text-card-foreground'>
                Klar for å oppleve Utekos®? Se vårt utvalg.
              </p>
              <BrandBadge className='dark:group-hover:bg-dark-card-foreground dark:group-hover:text-dark-card group-hover:bg-card-foreground group-hover:text-card'>
                Gå til butikken
              </BrandBadge>
            </Link>

            {/* MAGASINET */}
            <Link
              href='/magasinet'
              className='group dark:border-dark-sidebar-foreground/10 dark:bg-dark-sidebar dark:text-dark-sidebar-foreground dark:hover:border-dark-sidebar-foreground/50 dark:hover:bg-dark-card dark:hover:text-dark-card-foreground relative flex flex-col items-center justify-center rounded-3xl border border-sidebar-foreground/10 bg-sidebar p-12 text-center text-sidebar-foreground transition-all duration-500 hover:border-sidebar-foreground/50 hover:bg-card hover:text-card-foreground hover:shadow-2xl'
            >
              <div className='dark:bg-dark-sidebar-foreground dark:text-dark-sidebar dark:group-hover:bg-dark-card-foreground dark:group-hover:text-dark-card mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-foreground text-sidebar transition-all group-hover:scale-110 group-hover:bg-card-foreground group-hover:text-card'>
                <BookOpen className='h-8 w-8' />
              </div>
              <h3 className='dark:text-dark-sidebar-foreground dark:group-hover:text-dark-card-foreground mb-2 font-sans text-2xl font-bold text-sidebar-foreground group-hover:text-card-foreground'>
                Inspirasjon og historier
              </h3>
              <p className='dark:text-dark-sidebar-foreground/90 dark:group-hover:text-dark-card-foreground mb-8 max-w-sm text-sidebar-foreground/90 group-hover:text-card-foreground'>
                Les mer om tips og historier i vårt magasin.
              </p>
              <BrandBadge className='dark:group-hover:bg-dark-card-foreground dark:group-hover:text-dark-card group-hover:bg-card-foreground group-hover:text-card'>
                Les magasinet
              </BrandBadge>
            </Link>
          </div>
        </div>
      </article>
    </article>
  )
}
