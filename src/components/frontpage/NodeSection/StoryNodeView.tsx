import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/className'
import UtekosWordmark from '@/components/BrandComponents/utils/UtekosWordmark'
import { H3 } from '@/components/typography/TypographyH3'
import { P } from '@/components/typography/TypographyP'

interface StoryNodeViewProps {
  icon: LucideIcon
  label: string
  description: string
  tone: 'before' | 'after'
}

const toneStyles = {
  before: {
    card: 'border-border bg-muted text-foreground',
    iconWrap:
      'border-border bg-background text-ceramic ring-1 ring-border/80',
    glow: 'from-foreground/8 via-foreground/4 to-transparent',
    description: 'text-foreground/86',
    heading: 'text-foreground',
    wordmark: 'text-foreground',
    iconInset:
      'shadow-[inset_0_1px_0_color-mix(in_oklch,var(--color-ceramic)_24%,transparent)]'
  },
  after: {
    card: 'border-border bg-card text-card-foreground',
    iconWrap:
      'border-secondary/35 bg-secondary text-secondary-foreground ring-1 ring-secondary-foreground/20',
    glow: 'from-card-foreground/12 via-card-foreground/5 to-transparent',
    description: 'text-card-foreground/90',
    heading: 'text-card-foreground',
    wordmark: 'text-card-foreground',
    iconInset:
      'shadow-[inset_0_1px_0_color-mix(in_oklch,var(--color-secondary-foreground)_28%,transparent)]'
  }
} as const

export function StoryNodeView({
  icon: Icon,
  label,
  description,
  tone
}: StoryNodeViewProps) {
  const styles = toneStyles[tone]

  return (
    <article
      className={cn(
        'relative isolate flex h-full min-h-58 overflow-hidden rounded-[1.35rem] border p-5 text-left shadow-[0_24px_70px_-54px_color-mix(in_oklch,var(--color-card)_95%,transparent)] sm:min-h-62 sm:p-8',
        styles.card
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 bg-linear-to-br',
          styles.glow
        )}
        aria-hidden='true'
      />

      <div className='relative z-10 flex h-full min-h-0 flex-col justify-center gap-5 sm:gap-6'>
        <div className='flex min-w-0 items-center gap-4 sm:gap-5'>
          <div
            className={cn(
              'flex size-13 shrink-0 items-center justify-center rounded-2xl border sm:size-16',
              styles.iconWrap,
              styles.iconInset
            )}
          >
            <Icon
              aria-hidden='true'
              className='size-5 stroke-[1.75] sm:size-6.5'
            />
          </div>

          <H3
            className={cn(
              'inline-flex min-w-0 items-baseline gap-x-2 pb-0 text-3xl leading-none font-bold tracking-tight whitespace-nowrap sm:text-4xl md:text-4xl lg:text-[2.85rem]',
              styles.heading
            )}
          >
            <span>{label}</span>
            <span className='inline-flex items-baseline gap-x-1'>
              <span className='sr-only'>Utekos</span>
              <UtekosWordmark
                aria-hidden='true'
                role='presentation'
                className={cn(
                  'h-[0.72em] w-[2.95em] translate-y-[0.055em]',
                  styles.wordmark
                )}
              />
              <span className='text-[0.82em] leading-none'>
                ®:
              </span>
            </span>
          </H3>
        </div>

        <div className='max-w-104 text-left sm:pl-21'>
          <P
            className={cn(
              'font-utekos-text-medium text-xl leading-snug tracking-normal not-first:mt-0 sm:text-2xl',
              styles.description
            )}
          >
            {description}
          </P>
        </div>
      </div>
    </article>
  )
}
