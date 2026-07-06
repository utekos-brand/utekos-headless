import { cn } from '@/lib/utils'
import React from 'react'
import { motion } from 'motion/react'

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  animate?: boolean
}) => {
  const variants = {
    initial: {
      backgroundPosition: '0 50%'
    },
    animate: {
      backgroundPosition: ['0, 50%', '100% 50%', '0 50%']
    }
  }
  const animationProps =
    animate ?
      {
        variants,
        initial: 'initial',
        animate: 'animate',
        transition: {
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse' as const
        },
        style: {
          backgroundSize: '400% 400%'
        }
      }
    : {}

  return (
    <div className={cn('group relative p-[4px]', containerClassName)}>
      <motion.div
        {...animationProps}
        className={cn(
          'z-1ounded-3xl absolute inset-0 opacity-60 blur-xl transition duration-500 will-change-transform group-hover:opacity-100',
          'bg-[radial-gradient(circle_farthest-side_at_0_100%,#202a44,transparent),radial-gradient(circle_farthest-side_at_100%_0,#4a528f,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#d76b00,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]'
        )}
      />
      <motion.div
        {...animationProps}
        className={cn(
          'absolute inset-0 z-1 rounded-3xl will-change-transform',
          'bg-[radial-gradient(circle_farthest-side_at_0_100%,#7aef85,transparent),radial-gradient(circle_farthest-side_at_100%_0,#4a528f,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#d76b00,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]'
        )}
      />

      <div className={cn('relative z-10', className)}>{children}</div>
    </div>
  )
}
