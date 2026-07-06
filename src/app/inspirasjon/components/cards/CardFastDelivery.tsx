import Image from 'next/image'
import PostNordLogo from '@public/logo/PostNord.svg'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardFastDeliveryProps {
  className?: string
}

export function CardFastDelivery({
  className
}: CardFastDeliveryProps) {
  return (
    <Card
      size='sm'
      className={cn(
        'mx-auto flex h-full min-h-18 w-full max-w-none place-content-center items-center bg-teal-950 align-middle transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-[0_22px_54px_-38px_color-mix(in_oklch,var(--card)_92%,transparent)] sm:min-h-40 lg:aspect-6/2 lg:min-h-0 dark:border-slate-100 dark:hover:bg-teal-700'
      )}
    >
      <CardContent className='flex items-center justify-center px-0'>
        <Image
          src={PostNordLogo}
          alt='PostNord'
          width={125}
          height={50}
          className='h-9 w-auto sm:h-10 lg:h-12'
        />
      </CardContent>
    </Card>
  )
}
