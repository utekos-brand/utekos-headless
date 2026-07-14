'use client'

import { MomentCard } from '@/components/frontpage/MomentSection/MomentCard'
import { moments } from '@/components/frontpage/MomentSection/utils/moments'
import {
  motion,
  MotionConfig,
  type Variants
} from 'motion/react'

const gridMotion = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.08, staggerChildren: 0.12 }
  }
} satisfies Variants

export function MomentCardsGrid() {
  return (
    <MotionConfig reducedMotion='user'>
      <motion.ul
        className='m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3 lg:gap-8'
        initial='hidden'
        whileInView='visible'
        viewport={{
          once: true,
          amount: 0.2,
          margin: '0px 0px -80px 0px'
        }}
        variants={gridMotion}
      >
        {moments.map(moment => (
          <li
            key={moment.id}
            className='@container/moment-card h-full min-w-0'
          >
            <MomentCard moment={moment} />
          </li>
        ))}
      </motion.ul>
    </MotionConfig>
  )
}
