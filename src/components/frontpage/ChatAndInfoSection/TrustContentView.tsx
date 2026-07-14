'use client'

import type { ComponentType } from 'react'
import { motion, type Variants } from 'motion/react'
import { H2 } from '@/components/typography/TypographyH2'
import { P } from '@/components/typography/TypographyP'
import { cn } from '@/lib/utils/className'

type InfoCardsComponentProps = Record<string, never>

interface TrustContentViewProps {
  InfoCardsComponent: ComponentType<InfoCardsComponentProps>
}

const contentMotion = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
} satisfies Variants

const revealMotion = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] }
  }
} satisfies Variants

export function TrustContentView({
  InfoCardsComponent
}: TrustContentViewProps) {
  return (
    <motion.div
      variants={contentMotion}
      className={cn(
        'relative z-20 flex min-w-0 flex-col justify-start overflow-visible rounded-md bg-[color-mix(in_oklch,var(--color-card)_82%,var(--color-background)_18%)] p-4 px-6 text-card-foreground sm:px-8 md:py-6'
      )}
    >
      <div className='mb-2 max-w-prose'>
        <motion.div variants={revealMotion}>
          <H2
            ID='trust-section-heading'
            className='pb-0 text-3xl! text-card-foreground'
          >
            En opplevelse bygget på tillit
          </H2>
        </motion.div>

        <motion.div variants={revealMotion}>
          <P className='mt-4 mb-4 pb-2 text-base text-card-foreground/90 not-first:mt-0'>
            Fra du besøker siden vår til du nyter kveldssolen i ditt
            Utekos-plagg – vi er dedikerte til å levere en trygg og
            førsteklasses opplevelse i alle ledd.
          </P>
        </motion.div>
      </div>

      <motion.div
        variants={revealMotion}
        className='mt-10 flex w-full min-w-0 justify-center overflow-visible sm:mt-12 lg:mt-8'
      >
        <InfoCardsComponent />
      </motion.div>
    </motion.div>
  )
}
