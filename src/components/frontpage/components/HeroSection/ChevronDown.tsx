// Path: src/components/frontpage/components/HeroSection/ChevronDown.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Route } from 'next'
import { motion, useReducedMotion } from 'motion/react'
import { reportCanonicalHeroInteract } from '@/lib/analytics/heroInteractReporter'

const HERO_CTA_ID = 'read_more_hero'
const HERO_DESTINATION = '/skreddersy-varmen'

export function ChevronDownSection() {
  const shouldReduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={HERO_DESTINATION as Route}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        reportCanonicalHeroInteract({
          customData: {
            cta_id: HERO_CTA_ID,
            destination_path: HERO_DESTINATION,
            click_sequence: 1
          }
        })
      }}
      className='motion-cta group relative inline-flex min-h-11 items-center justify-center px-5 py-4'
      aria-label='Gå til skreddersy varmen'
      data-track='ReadMoreHeroClick'
    >
      <div className='relative flex items-center gap-3'>
        <motion.span
          animate={{ x: hovered && !shouldReduceMotion ? 2 : 0 }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
          }}
          className='dark:group-hover:text-dark-foreground block text-sm leading-none font-medium tracking-[-0.01em] text-foreground transition-colors group-hover:text-foreground'
        >
          Les mer
        </motion.span>

        <motion.span
          aria-hidden
          animate={
            shouldReduceMotion ? { x: 0, scale: 1 }
            : hovered ?
              { x: 8, scale: 1.1 }
            : { x: [0, 3, 0], scale: 1 }
          }
          transition={
            hovered || shouldReduceMotion ?
              { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }
            : {
                duration: 1.2,
                ease: 'easeInOut',
                repeat: Infinity
              }
          }
          className='inline-flex text-foreground'
        >
          <ArrowRight className='size-4' />
        </motion.span>
      </div>

      <motion.span
        className='dark:via-dark-foreground absolute bottom-3 left-0 h-px w-full origin-center bg-linear-to-r from-transparent via-foreground to-transparent'
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      />
    </Link>
  )
}
