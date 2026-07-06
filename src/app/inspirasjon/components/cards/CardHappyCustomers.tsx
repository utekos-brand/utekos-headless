import {
  Card,
  CardFooter,
  CardHeader
} from '@/components/ui/card'
import FilledHeartSmiley from '@public/icons/FilledHeartSmile.svg'
import Image from 'next/image'
import { ReviewsButton } from '../ReviewsButton'
import { cn } from '@/lib/utils'
import { H3 } from '@/components/typography/TypographyH3'

export function CardHappyCustomers() {
  return (
    <Card
      size='sm'
      className={cn(
        'lg:min-h-00 mx-auto flex h-full min-h-18 w-full max-w-none items-center justify-center bg-teal-950 text-center transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-[0_22px_54px_-38px_color-mix(in_oklch,var(--card)_92%,transparent)] sm:min-h-40 lg:aspect-6/2'
      )}
    >
      <CardHeader className='mx-auto w-full px-0 text-center'>
        <div className='flex place-content-center items-center justify-center gap-2 align-middle'>
          <Image
            src={FilledHeartSmiley}
            alt='Filled Heart Smiley'
            width={20}
            height={20}
            className='size-5 shrink-0 sm:size-6'
          />
          <H3 className='pb-0 text-lg leading-tight font-semibold tracking-normal text-card-foreground sm:text-xl!'>
            3000+ fornøyde kunder
          </H3>
        </div>
      </CardHeader>
      <CardFooter className='flex justify-center px-0 pt-1'>
        <ReviewsButton />
      </CardFooter>
    </Card>
  )
}
