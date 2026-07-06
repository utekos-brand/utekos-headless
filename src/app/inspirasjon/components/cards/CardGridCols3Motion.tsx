'use client'

import { Children, type ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation, type Variants } from 'motion/react'
import * as m from 'motion/react-m'
import { cn } from '@/lib/utils/className'

const itemMotion = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.985
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.07,
      duration: 0.48,
      ease: [0.22, 1, 0.36, 1]
    }
  })
} satisfies Variants

interface CardGridCols3MotionProps {
  labelledBy: string
  className?: string
  itemClassName?: string
  children: ReactNode
}

export function CardGridCols3Motion({
  labelledBy,
  className,
  itemClassName,
  children
}: CardGridCols3MotionProps) {
  const childrenArray = Children.toArray(children)

  return (
    <MotionConfig reducedMotion='user'>
      <LazyMotion features={domAnimation} strict>
        <m.ul
          aria-labelledby={labelledBy}
          className={className}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2, margin: '0px 0px -72px 0px' }}
        >
          {childrenArray.map((child, index) => (
            <m.li
              key={`card-grid-cols-3-${index}`}
              className={cn(itemClassName)}
              custom={index}
              variants={itemMotion}
            >
              {child}
            </m.li>
          ))}
        </m.ul>
      </LazyMotion>
    </MotionConfig>
  )
}
