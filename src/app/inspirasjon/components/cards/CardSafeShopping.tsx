import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { KlarnaLogo } from '@/components/payments/KlarnaLogo'
import { VippsLogo } from '@/components/payments/VippsLogo'
import VisaWhiteLogo from '@public/logo/VisaWhiteLogo.svg'
import Image from 'next/image'
import { H3 } from '@/components/typography/TypographyH3'

export function CardSafeShopping() {
  return (
    <Card
      size='sm'
      className='mx-auto flex h-full min-h-18 w-full max-w-none justify-center border border-card-foreground/14 bg-teal-950 p-4 text-center text-card-foreground shadow-[0_18px_48px_-36px_color-mix(in_oklch,var(--card)_88%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-[0_22px_54px_-38px_color-mix(in_oklch,var(--card)_92%,transparent)] sm:min-h-40 lg:aspect-6/2 lg:min-h-0 dark:border-card-foreground/14'
    >
      <CardHeader className='mx-auto w-full px-0 text-center'>
        <CardTitle className='text-center'>
          <H3 className='pb-0 text-lg leading-tight font-semibold tracking-normal text-card-foreground sm:text-xl!'>
            Trygg handel
          </H3>
        </CardTitle>
      </CardHeader>

      <CardContent className='px-0'>
        <ul
          aria-label='Betalingsmetoder: Vipps, Visa og Klarna'
          className='flex items-center justify-center gap-3 sm:gap-4'
        >
          <li
            aria-label='Vipps'
            className='flex min-h-11 items-center justify-center py-2 sm:min-h-12'
          >
            <VippsLogo
              aria-hidden='true'
              className='h-5 w-auto sm:h-6'
            />
          </li>
          <li
            aria-label='Visa'
            className='flex min-h-14 items-center justify-center py-2 sm:min-h-15'
          >
            <Image
              src={VisaWhiteLogo}
              alt=''
              height={60}
              width={60}
              aria-hidden='true'
              className='h-8 w-auto object-contain sm:h-9'
            />
          </li>
          <li
            aria-label='Klarna'
            className='flex min-h-11 items-center justify-center py-2 sm:min-h-12'
          >
            <KlarnaLogo
              aria-hidden='true'
              className='h-7 w-auto sm:h-8'
            />
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
