import {
  ArrowUpDown,
  CloudRainWind,
  MoveDiagonal2,
  Waves
} from 'lucide-react'
import { PageSection } from '@/components/layout/PageSection'

const benefits = [
  {
    label: 'Vanntett og vindtett',
    description: '8000 mm vannsøyle og tapede sømmer',
    Icon: CloudRainWind
  },
  {
    label: 'Varmt SherpaCore™-fôr',
    description: '250 GSM, mykt og antipeeling-behandlet',
    Icon: Waves
  },
  {
    label: 'Toveis YKK®-glidelås',
    description: 'Enklere av- og påkledning og regulering',
    Icon: ArrowUpDown
  },
  {
    label: 'Frihet til å bevege deg',
    description: 'Romslig unisex-snitt med praktiske splitter',
    Icon: MoveDiagonal2
  }
] as const

export function ComfyrobeBenefitStrip() {
  return (
    <PageSection
      background='alternate'
      aria-label='Viktigste egenskaper'
      contentClassName='py-7 sm:py-9 lg:py-12'
    >
      <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
        {benefits.map(({ label, description, Icon }) => (
          <li
            key={label}
            className='flex min-h-24 items-start gap-4 rounded-2xl border border-card-foreground/30 bg-alternate p-4 sm:p-5'
          >
            <span className='flex size-11 shrink-0 items-center justify-center rounded-full border border-card-foreground/40 text-card-foreground'>
              <Icon className='size-5' aria-hidden='true' />
            </span>
            <div>
              <p className='font-utekos-text-medium text-base leading-5 text-card-foreground'>
                {label}
              </p>
              <p className='font-utekos-text mt-1 text-sm leading-5 text-card-foreground'>
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </PageSection>
  )
}
