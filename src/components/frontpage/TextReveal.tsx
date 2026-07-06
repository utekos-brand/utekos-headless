import { cn } from '@/lib/utils/className'

export function CinematicWord({
  children,
  className,
  delay = 0
}: {
  children: string
  className?: string
  delay?: number
}) {
  return (
    <span
      data-cinematic-word=''
      data-motion-delay={delay}
      className={cn('inline-block transform-gpu', className)}
    >
      {children}
    </span>
  )
}

export function LuxuryShimmerText({
  text,
  className
}: {
  text: string
  className?: string
}) {
  return (
    <span
      className={cn('group relative inline-block', className)}
    >
      <span className='animate-shimmer-gold relative z-10 bg-linear-to-br from-amber-100 via-amber-300 to-amber-500 bg-size-[200%_auto] bg-clip-text text-transparent'>
        {text}
      </span>

      <span className='absolute inset-0 bg-amber-400/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-40' />
    </span>
  )
}

export function OrganicCircleWord({
  children,
  delay = 0
}: {
  children: string
  delay?: number
}) {
  return (
    <span
      data-organic-circle-word=''
      data-motion-delay={delay}
      className='relative inline-block px-1'
    >
      <CinematicWord
        delay={delay}
        className='relative z-10 font-medium text-foreground'
      >
        {children}
      </CinematicWord>

      <svg
        className='pointer-events-none absolute top-1/2 left-1/2 h-[130%] w-[115%] -translate-x-1/2 translate-y-[-45%] overflow-visible'
        viewBox='0 0 100 50'
        preserveAspectRatio='none'
      >
        <path
          data-organic-circle-path=''
          d='M5,25 C5,8 25,5 50,5 C75,5 95,8 95,25 C95,42 75,45 50,45 C25,45 5,42 5,25 Z'
          fill='none'
          stroke='var(--circle-stroke, var(--ancient-water))'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='opacity-90'
          vectorEffect='non-scaling-stroke'
        />
      </svg>
    </span>
  )
}

export function GlowWord({
  children,
  delay = 0
}: {
  children: string
  delay?: number
}) {
  return (
    <span className='relative mx-1 inline-block'>
      <span className='animate-pulse-slow absolute inset-0 rounded-full bg-foreground/10 blur-lg' />
      <CinematicWord
        delay={delay}
        className='relative z-10 font-medium text-foreground italic'
      >
        {children}
      </CinematicWord>
    </span>
  )
}
