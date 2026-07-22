import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSection } from '@/components/layout/PageSection'

const FIT_POINTS = [
  'Romslig, unisex og avslappet passform',
  'Plass til våte klær, tykke gensere og flere lag',
  'Splitter i sidene og bak gir bedre bevegelsesfrihet',
  'Justerbar ermekant gjør det enkelt å tilpasse åpningen'
] as const

const BACK_IMAGE =
  'https://cdn.shopify.com/s/files/1/0634/2154/6744/files/Comfyrobe-Bakside-1080x1350.png'

export function ComfyrobeFitSection() {
  return (
    <PageSection
      id='passform'
      background='default'
      aria-labelledby='comfyrobe-fit-heading'
    >
      <div className='grid items-center gap-9 lg:grid-cols-2 lg:gap-14'>
        <div className='order-2 lg:order-1'>
          <p className='font-utekos-text-medium text-sm uppercase tracking-[0.18em] text-foreground'>
            Riktig størrelse uten gjetting
          </p>
          <h2
            id='comfyrobe-fit-heading'
            className='mt-4 font-sans text-3xl font-bold text-balance text-foreground sm:text-4xl lg:text-5xl'
          >
            Laget for lagene du allerede bruker
          </h2>
          <p className='font-utekos-text mt-5 max-w-xl text-base leading-7 text-foreground sm:text-lg'>
            Comfyrobe™ skal være enkel å trekke over klærne når du
            trenger varme. Passformen er derfor bevisst romslig, uten
            å ofre bevegelsesfriheten.
          </p>

          <ul className='mt-7 space-y-4'>
            {FIT_POINTS.map(point => (
              <li
                key={point}
                className='font-utekos-text flex items-start gap-3 text-base leading-6 text-foreground'
              >
                <span className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-foreground/40'>
                  <Check className='size-4' aria-hidden='true' />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
            <Button
              asChild
              size='lg'
              className='font-utekos-text-medium min-h-12 rounded-full px-6'
            >
              <Link href='/handlehjelp/storrelsesguide'>
                Se størrelsesguiden
                <ArrowUpRight className='size-4' aria-hidden='true' />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='font-utekos-text-medium min-h-12 rounded-full px-6'
            >
              <Link href='/handlehjelp/vask-og-vedlikehold'>
                Vask og vedlikehold
              </Link>
            </Button>
          </div>
        </div>

        <div className='order-1 relative aspect-4/5 overflow-hidden rounded-3xl border border-foreground/30 bg-foreground/[0.04] lg:order-2'>
          <Image
            src={BACK_IMAGE}
            alt='Comfyrobe sett bakfra med romslig passform og splitt.'
            fill
            sizes='(min-width: 1024px) 50vw, 100vw'
            className='object-cover object-center'
          />
        </div>
      </div>
    </PageSection>
  )
}
