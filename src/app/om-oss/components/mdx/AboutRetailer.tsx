import { Button } from '@/components/ui/button'
import { INTERSPORT_LAKSEVAG_MAPS_URL } from '@/constants/maps'
import IntersportLogo from '@public/logo/Intersport_logo.svg'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { AboutBadge } from './AboutBadge'

export function AboutRetailer() {
  return (
    <article className='dark:bg-dark-secondary dark:text-dark-secondary-foreground bg-secondary py-20 text-secondary-foreground sm:py-28'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='dark:bg-dark-background grid grid-cols-1 items-center gap-10 rounded-3xl bg-background p-6 md:grid-cols-[0.85fr_1.15fr] md:p-8 lg:p-10'>
          <div className='dark:bg-dark-foreground flex min-h-48 items-center justify-center rounded-lg bg-foreground p-8'>
            <Image
              src={IntersportLogo}
              alt='Intersport logo'
              width={1024}
              height={112}
              className='h-auto w-full max-w-xs'
            />
          </div>

          <div>
            <AboutBadge
              variant='accent'
              className=' mb-6 border border-border'
            >
              Fysisk butikk i Bergen
            </AboutBadge>
            <h2 className='font-sans text-3xl leading-tight font-semibold text-foreground sm:text-4xl'>
              Opplev Utekos hos Intersport Laksevåg
            </h2>
            <p className='/80 mt-5 max-w-2xl text-lg leading-8 text-foreground/80'>
              Lyst til å kjenne på kvaliteten og finne den
              perfekte passformen? Som eneste fysiske forhandler
              i Bergen finner du et utvalg av våre produkter hos
              våre venner på Laksevåg Senter.
            </p>
            <Button
              asChild
              className='dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-dark-primary-hover mt-8 min-h-12 gap-2 rounded-3xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground'
              size='lg'
            >
              <Link
                href={INTERSPORT_LAKSEVAG_MAPS_URL}
                target='_blank'
                rel='noreferrer'
              >
                Få veibeskrivelse
                <MapPin aria-hidden='true' className='size-5' />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
