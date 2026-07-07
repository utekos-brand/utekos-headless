import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { PaymentIcons } from '@/components/payments/PaymentIcons'
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
        <PaymentIcons />
      </CardContent>
    </Card>
  )
}
