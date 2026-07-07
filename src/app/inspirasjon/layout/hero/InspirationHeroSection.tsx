import type { ReactNode } from 'react'
import { InspirationContentShell } from '@/app/inspirasjon/components/InspirationContentShell'
import { cn } from '@/lib/utils/className'
import type { InspirationHeroAlign } from './types'

interface InspirationHeroSectionProps {
  children: ReactNode
  labelledBy: string
  as?: 'section' | 'article'
  align?: InspirationHeroAlign
  minHeight?: 'standard' | 'tall' | 'content'
  surfaceClassName?: string
  background?: ReactNode
  className?: string
  containerClassName?: string
  maxWidthClassName?: string
}

export function InspirationHeroSection({
  children,
  labelledBy,
  as: Tag = 'section',
  align = 'left',
  minHeight = 'content',
  surfaceClassName,
  background,
  className,
  containerClassName,
  maxWidthClassName = 'max-w-5xl'
}: InspirationHeroSectionProps) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={cn(
        'relative isolate flex overflow-hidden',
        minHeight === 'tall' ? 'min-h-[110svh]' : 'min-h-0',
        align === 'center' ? 'flex-col justify-center' : 'items-start',
        surfaceClassName,
        className
      )}
    >
      {background}

      <InspirationContentShell
        className={cn(
          'relative z-10 py-16 sm:py-20',
          containerClassName
        )}
      >
        <div
          className={cn(maxWidthClassName, align === 'center' && 'mx-auto text-center')}
        >
          {children}
        </div>
      </InspirationContentShell>
    </Tag>
  )
}
