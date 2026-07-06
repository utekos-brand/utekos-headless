'use client'

import { motion, type Variants } from 'motion/react'
import type { Moment } from '@/components/frontpage/MomentSection/utils/moments'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { H3 } from '@/components/typography/TypographyH3'
import { P } from '@/components/typography/TypographyP'
import { cn } from '@/lib/utils/className'

const cardMotion = {
  hidden: { opacity: 0, y: 32, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] }
  },
  hover: {
    y: -6,
    scale: 1.012,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
      mass: 0.85
    }
  }
} satisfies Variants

const articleClassName = 'group h-full min-w-0'

const iconClassName =
  'flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary dark:bg-ceramic text-primary-foreground  shadow-xs ring-1 ring-primary/20 transition-transform duration-300 ease-out group-hover:scale-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100'

const cardClassName =
  'h-full border border-border p-8 text-card-foreground bg-background shadow-md transition-shadow duration-300 group-hover:shadow-lg motion-reduce:transition-none'

export function MomentCard({ moment }: { moment: Moment }) {
  const Icon = moment.icon
  const titleId = `moment-${moment.id}-title`

  return (
    <motion.article
      aria-labelledby={titleId}
      variants={cardMotion}
      whileHover='hover'
      className={articleClassName}
    >
      <Card className={cn(cardClassName, 'bg-background')}>
        <CardHeader className='flex flex-row items-center gap-4 px-0 pb-0'>
          <span className={iconClassName} aria-hidden='true'>
            <Icon
              aria-hidden='true'
              className='size-5 stroke-[1.75]'
            />
          </span>

          <CardTitle className='text-card-foreground'>
            <H3
              ID={titleId}
              className='pb-0 text-2xl leading-tight font-semibold tracking-normal text-balance text-card-foreground'
            >
              {moment.title}
            </H3>
          </CardTitle>
        </CardHeader>

        <CardContent className='flex flex-1 px-0 pb-0 text-card-foreground'>
          <CardDescription className='font-utekos-text text-base leading-relaxed tracking-normal text-card-foreground'>
            <P className='text-base leading-relaxed tracking-normal text-card-foreground not-first:mt-0'>
              {moment.description}
            </P>
          </CardDescription>
        </CardContent>
      </Card>
    </motion.article>
  )
}
