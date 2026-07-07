import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { UtekosBreadcrumbBar } from '@/components/navigation/UtekosBreadcrumbBar'
import Link from 'next/link'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Camping og Utekos | Mer komfort på tur',
  description:
    'Inspirasjon til hvordan Utekos gjør campingturen varmere og mer komfortabel — fra kjølige morgener til sene kvelder.',
  alternates: { canonical: '/inspirasjon/camping' }
}

export default function CampingPage() {
  return (
    <article className='overflow-x-clip bg-background text-foreground'>
      <InspirationContentShell className='max-w-3xl py-16 sm:py-20'>
        <UtekosBreadcrumbBar
          surface='transparent'
          items={[
            { label: 'Forsiden', href: '/' },
            { label: 'Inspirasjon', href: '/inspirasjon' },
            { label: 'Camping' }
          ]}
        />
        <h1 className='mt-8 max-w-2xl text-4xl leading-tight font-bold text-balance sm:text-5xl'>
          Camping med Utekos
        </h1>
        <p className='mt-6 max-w-2xl text-lg leading-relaxed text-foreground/90'>
          Mer tid ute når temperaturen faller. Utforsk hvordan
          Utekos gir ekstra komfort på telttur, i bobil og på
          campingplassen.
        </p>
        <div className='mt-8 flex flex-wrap gap-4'>
          <BrandBadge
            asChild
            backgroundColor='var(--primary)'
            textColor='var(--primary-foreground)'
            className='group min-h-12 border border-transparent px-6 py-3 text-base font-bold'
          >
            <Link href='/produkter'>
              Se produkter
              <ArrowRight className='ml-2 inline size-4' />
            </Link>
          </BrandBadge>
          <BrandBadge
            asChild
            backgroundColor='var(--secondary)'
            textColor='var(--secondary-foreground)'
            className='min-h-12 border border-border px-6 py-3 text-base font-bold'
          >
            <Link href='/inspirasjon/bobil'>Les om bobil</Link>
          </BrandBadge>
        </div>
      </InspirationContentShell>
    </article>
  )
}
