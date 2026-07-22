import Link from 'next/link'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageSection } from '@/components/layout/PageSection'

export function ComfyrobeFinalCta() {
  return (
    <PageSection
      background='default'
      aria-labelledby='comfyrobe-final-cta-heading'
    >
      <div className='overflow-hidden rounded-3xl border border-foreground/30 bg-card px-6 py-10 text-center text-card-foreground shadow-xl sm:px-10 sm:py-14 lg:px-16 lg:py-20'>
        <p className='font-utekos-text-medium text-sm uppercase tracking-[0.18em] text-card-foreground'>
          Utekos · Skreddersy varmen
        </p>
        <h2
          id='comfyrobe-final-cta-heading'
          className='mx-auto mt-4 max-w-4xl font-sans text-3xl font-bold text-balance text-card-foreground sm:text-4xl lg:text-6xl'
        >
          Gjør været til en mindre del av planen
        </h2>
        <p className='font-utekos-text mx-auto mt-5 max-w-2xl text-base leading-7 text-card-foreground sm:text-lg'>
          Gå tilbake til produktvalgene, finn størrelsen din og legg
          Comfyrobe™ i handlekurven uten å forlate siden.
        </p>
        <Button
          asChild
          size='lg'
          className='font-utekos-text-medium mt-8 min-h-13 rounded-full px-7 text-base'
        >
          <Link href='#comfyrobe-valg'>
            Velg størrelse og kjøp
            <ArrowUp className='size-4' aria-hidden='true' />
          </Link>
        </Button>
      </div>
    </PageSection>
  )
}
