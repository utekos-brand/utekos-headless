'use client'

import { Lock, ShoppingBag } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import Image from 'next/image'
import UtekosLogo from '@public/icon.png'
import { cn } from '@/lib/utils/className'
import Link from 'next/link'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'
import { H3 } from '@/components/typography/TypographyH3'
import { InlineText } from '@/components/typography/TypographyInlineText'
import { P } from '@/components/typography/TypographyP'

const TrafficLights = ({
  variant = 'default'
}: {
  variant?: 'default' | 'colored' | 'card'
}) => {
  const colors =
    variant === 'colored' ?
      [
        'bg-destructive dark:bg-dark-destructive',
        'bg-chart-3 dark:bg-dark-chart-3',
        'bg-chart-4 dark:bg-dark-chart-4'
      ]
    : variant === 'card' ?
      [
        'bg-card-foreground/45 -foreground/45',
        'bg-card-foreground/65 -foreground/65',
        'bg-card-foreground/85 -foreground/85'
      ]
    : [
        'bg-secondary-foreground/45 dark:bg-dark-secondary-foreground/45',
        'bg-secondary-foreground/65 dark:bg-dark-secondary-foreground/65',
        'bg-secondary-foreground/85 dark:bg-dark-secondary-foreground/85'
      ]

  return (
    <div className='absolute top-3 left-3 z-20 flex gap-1.5'>
      {colors.map((color, i) => (
        <div
          key={i}
          className={cn('h-2 w-2 rounded-full', color)}
        />
      ))}
    </div>
  )
}

const stackMotion = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } }
} satisfies Variants

const cardMotion = {
  hidden: { opacity: 0, x: -26, y: 10, rotate: -1.5 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    transition: { duration: 0.66, ease: [0.22, 1, 0.36, 1] }
  }
} satisfies Variants

const cardBaseClasses =
  'absolute overflow-hidden rounded-xl border shadow-2xl shadow-black/16 will-change-transform'

const backCardSizeClasses =
  'h-40 w-[min(100%,17.5rem)] p-4 sm:h-48 sm:w-[min(100%,24rem)] sm:p-6'

const frontCardSizeClasses =
  'h-40 w-[min(88%,17.5rem)] p-4 sm:h-48 sm:w-[min(86%,24rem)] sm:p-6 lg:w-[min(86%,calc(100%-4.5rem))] xl:w-[min(86%,24rem)]'

const backCardClasses = cn(
  cardBaseClasses,
  'border-card-foreground/14 bg-[color-mix(in_oklch,var(--color-card)_94%,var(--color-foreground)_6%)] text-card-foreground'
)

const frontCardClasses = cn(
  cardBaseClasses,
  'border-foreground/12 bg-background text-foreground dark:border-dark-foreground/12 dark:bg-dark-background dark:text-dark-foreground'
)

/* Icon chips invert each card surface; ratios in src/tokens/semantic.*.css. */
const backCardIconClassName =
  'flex size-8 shrink-0 items-center justify-center rounded-lg border border-card-foreground/35 dark:border-dark-card-foreground/35 bg-card-foreground -foreground text-card '

const frontCardIconClassName =
  'flex size-8 shrink-0 items-center justify-center rounded-lg border border-foreground/20 bg-foreground/8 text-foreground dark:border-dark-foreground/20 dark:bg-dark-foreground/10 dark:text-dark-foreground'

const frontCardPositionClasses =
  'top-28 left-10 sm:top-32 sm:left-5 md:top-32 md:left-4 lg:top-36 lg:left-[min(38%,9rem)] xl:left-[min(44%,10.5rem)]'

export function InfoCardStackView() {
  return (
    <motion.div
      variants={stackMotion}
      className='relative z-20 mx-auto h-[19rem] w-full max-w-[23rem] overflow-visible sm:h-80 sm:max-w-[25rem] lg:h-[23rem] lg:max-w-[26rem]'
    >
      <div
        className='pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(70%_64%_at_24%_18%,color-mix(in_oklch,var(--color-secondary-foreground)_10%,transparent),transparent_68%)]'
        aria-hidden
      />

      <motion.div
        variants={cardMotion}
        whileHover={{ y: -4, transition: { duration: 0.24 } }}
        className={cn(
          backCardClasses,
          'top-0 left-0',
          backCardSizeClasses
        )}
      >
        <div
          className='pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(72%_64%_at_18%_22%,color-mix(in_oklch,var(--color-card-foreground)_10%,transparent),transparent_66%)]'
          aria-hidden
        />
        <BackgroundRippleEffect
          rows={5}
          cols={11}
          cellSize={38}
          interactive={false}
          className='pointer-events-none opacity-40'
        />
        <TrafficLights variant='card' />
        <div className='relative z-10 mt-6 flex items-start gap-3'>
          <div className={backCardIconClassName}>
            <ShoppingBag className='h-4 w-4 stroke-[1.7] sm:h-5 sm:w-5' />
          </div>
          <div>
            <H3 className='pb-0 text-sm font-semibold text-card-foreground sm:text-base'>
              En trygg handel
            </H3>
            <P className='/88 mt-1 text-xs leading-snug font-normal text-card-foreground/88 not-first:mt-0 sm:text-sm'>
              Sikre betalingsløsninger og 14 dagers angrerett.
            </P>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={cardMotion}
        whileHover={{ y: -4, transition: { duration: 0.24 } }}
        className={cn(
          frontCardClasses,
          frontCardPositionClasses,
          frontCardSizeClasses
        )}
      >
        <BackgroundRippleEffect
          rows={5}
          cols={11}
          cellSize={38}
          interactive={false}
          className='pointer-events-none opacity-25'
        />
        <div
          className='absolute inset-0 z-0 bg-[radial-gradient(75%_62%_at_68%_20%,color-mix(in_oklch,var(--color-foreground)_8%,transparent),transparent_62%)]'
          aria-hidden
        />

        <TrafficLights variant='colored' />

        <div className='relative z-10 flex h-full flex-col'>
          <div className='mt-6 flex items-start gap-3'>
            <div className={frontCardIconClassName}>
              <Lock className='size-4 stroke-[1.7] sm:size-5' />
            </div>
            <div>
              <H3 className='pb-0 text-sm font-semibold text-foreground sm:text-base'>
                Ditt personvern
              </H3>
              <P className='mt-1 text-sm leading-snug font-normal text-foreground/88 not-first:mt-0 sm:text-base'>
                Vi tar personvern på alvor. Se hvordan vi
                behandler dine data i vår{' '}
                <Link
                  href='/personvern'
                  className='font-normal text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:focus-visible:outline-dark-foreground'
                >
                  <InlineText>personvernserklæring</InlineText>
                </Link>
                .
              </P>
            </div>
          </div>

          <div className='mt-auto flex justify-center py-3 pt-2'>
            <Image
              src={UtekosLogo}
              alt='Utekos Logo'
              width={32}
              height={32}
              className='size-7 sm:size-9'
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
