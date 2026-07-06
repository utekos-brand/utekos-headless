'use client'

import type { ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'

interface SkreddersyMotionProviderProps {
  children: ReactNode
}

export function SkreddersyMotionProvider({
  children
}: SkreddersyMotionProviderProps) {
  return (
    <MotionConfig reducedMotion='user'>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  )
}
