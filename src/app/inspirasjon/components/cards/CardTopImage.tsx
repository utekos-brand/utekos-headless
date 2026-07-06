import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import KystHus from '@public/juster-form-nyt-1080x1080.webp'
import Image from 'next/image'

type CardTopImageProps = {
  className?: string
}

export function CardTopImage({ className }: CardTopImageProps) {
  return (
    <Card
      className={cn(
        'w-full max-w-md gap-0 overflow-hidden p-0 [--card-spacing:0]',
        className
      )}
    >
      <Image
        src={KystHus}
        alt='Kysthus med Utekos-varme – juster, form og nyt uteplassen'
        width={1080}
        height={1080}
        className='block aspect-square w-full rounded-xl object-cover'
        sizes='(min-width: 1024px) 448px, (min-width: 432px) 40vw, 100vw'
      />
    </Card>
  )
}
