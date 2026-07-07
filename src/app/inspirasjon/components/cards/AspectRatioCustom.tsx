import { AspectRatio } from '@/components/ui/aspect-ratio'
import KystHus from '@public/Utekos-TechDown-Kysthus-612x705.png'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export function AspectRatioCustom({
  children = null,
  className,
  ratio = 141 / 122
}: {
  children?: React.ReactNode
  className?: string
  ratio?: number
}) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      {children}
    </AspectRatio>
  )
}

const justerFormNytLineClassName =
  'block max-w-full font-sans text-[clamp(5rem,min(20vw,19cqi),15rem)] leading-[0.86] font-extrabold tracking-[-0.055em]'

export function CardAspectRatioCustomContent({
  className
}: {
  className?: string
}) {
  return (
    <AspectRatioCustom
      className={cn(
        className ?? 'w-full',
        '@container flex min-w-0 items-center justify-center overflow-hidden'
      )}
      ratio={141 / 122}
    >
      <div className='mx-auto flex w-fit max-w-full min-w-0 flex-col items-start px-4 text-left sm:px-6'>
        <span
          className={cn(
            justerFormNytLineClassName,
            'text-light'
          )}
        >
          JUSTER.
        </span>
        <span
          className={cn(
            justerFormNytLineClassName,
            'text-[#00957a]'
          )}
        >
          FORM.
        </span>
        <span
          className={cn(
            justerFormNytLineClassName,
            'text-primary'
          )}
        >
          NYT.
        </span>
      </div>
    </AspectRatioCustom>
  )
}

export function CardAspectRatioCustom({
  className
}: {
  className?: string
  image?: string
}) {
  return (
    <AspectRatioCustom
      ratio={1 / 1}
      className={cn(
        className,
        'flex items-center justify-center overflow-hidden'
      )}
    >
      <Image
        src={KystHus}
        alt='Kysthus med Utekos-varme – juster, form og nyt uteplassen'
        className='scale-70 rounded-xl object-contain'
        width={612}
        height={705}
      />
    </AspectRatioCustom>
  )
}