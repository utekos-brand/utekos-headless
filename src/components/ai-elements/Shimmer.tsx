'use client'

import { cn } from '@/lib/utils/className'
import { motion, type MotionProps } from 'motion/react'
import type { CSSProperties } from 'react'

type MotionHTMLProps = MotionProps & Record<string, unknown>

const shimmerMotionComponents = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  p: motion.p,
  span: motion.span
} satisfies Record<string, React.ComponentType<MotionHTMLProps>>

export interface TextShimmerProps {
  children: string
  as?: keyof typeof shimmerMotionComponents
  className?: string
  duration?: number
  spread?: number
}

const ShimmerComponent = ({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2
}: TextShimmerProps) => {
  const MotionComponent = shimmerMotionComponents[Component]

  const dynamicSpread = children.length * spread

  return (
    <MotionComponent
      animate={{ backgroundPosition: '0% center' }}
      className={cn(
        'relative inline-block bg-size-[250%_100%,auto] bg-clip-text text-transparent',
        '[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      style={
        {
          '--spread': `${dynamicSpread}px`,
          'backgroundImage':
            'var(--bg), linear-gradient(var(--shimmer-color,var(--color-muted-foreground)), var(--shimmer-color,var(--color-muted-foreground)))'
        } as MotionProps['style'] & CSSProperties
      }
      transition={{
        duration,
        ease: 'linear',
        repeat: Number.POSITIVE_INFINITY
      }}
    >
      {children}
    </MotionComponent>
  )
}

export const Shimmer = ShimmerComponent
