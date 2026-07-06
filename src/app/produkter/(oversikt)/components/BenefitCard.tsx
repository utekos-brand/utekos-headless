// Path: src/app/produkter/(oversikt)/components/BenefitCard.tsx

'use client'

import { Check } from 'lucide-react'
import type { CSSProperties } from 'react'

type BenefitSurface = 'muted' | 'accent' | 'mutedAlt'

interface Benefit {
  label: string
  description: string
  glowColor: string
  surface?: BenefitSurface
}

interface BenefitCardProps {
  benefit: Benefit
  delay: number
}

const surfaceStyles: Record<
  BenefitSurface,
  {
    background: string
    borderColor: string
    textColor: string
    descriptionColor: string
    iconColor?: string
  }
> = {
  muted: {
    background: 'var(--muted)',
    borderColor: 'var(--border)',
    textColor: 'var(--muted-foreground)',
    descriptionColor: 'var(--muted-foreground)'
  },
  accent: {
    background: 'var(--accent)',
    borderColor:
      'color-mix(in oklch, var(--accent-foreground) 28%, transparent)',
    textColor: 'var(--accent-foreground)',
    descriptionColor: 'var(--accent-foreground)'
  },
  mutedAlt: {
    background: 'var(--muted)',
    borderColor: 'var(--border)',
    textColor: 'var(--muted-foreground)',
    descriptionColor: 'var(--muted-foreground)'
  }
}

export function BenefitCard({ benefit, delay }: BenefitCardProps) {
  const surface = surfaceStyles[benefit.surface ?? 'accent']

  return (
    <li
      className='animate-fade-in-on-scroll group relative overflow-hidden rounded-[1.05rem] border     shadow-[0_18px_44px_-36px_color-mix(in_oklch,var(--background)_82%,transparent)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
      style={
        {
          '--animation-delay': `${delay}s`,
          '--benefit-accent': benefit.glowColor,
          'borderColor': surface.borderColor,
          'background': surface.background
        } as CSSProperties
      }
    >
      <div
        className='pointer-events-none absolute -inset-x-8 -top-20 h-44 opacity-[0.14] blur-3xl transition-opacity duration-300 group-hover:opacity-[0.22]'
        style={{
          background: 'radial-gradient(120% 120% at 50% 0%, transparent 38%, var(--benefit-accent) 100%)'
        }}
      />

      <div className='relative z-10 flex min-h-[3.75rem] items-center gap-3 px-4 py-3.5'>
        <div
          className='flex size-8 shrink-0 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none'
          style={{
            borderColor: 'color-mix(in oklch, var(--benefit-accent) 44%, transparent)',
            background: 'color-mix(in oklch, var(--background) 86%, var(--benefit-accent) 14%)'
          }}
        >
          <Check
            className='size-5'
            style={{ color: surface.iconColor ?? 'var(--benefit-accent)' }}
            aria-hidden='true'
          />
        </div>

        <div className='flex-1  '>
          <span className='font-semibold' style={{ color: surface.textColor }}>
            {benefit.label}
          </span>
          {benefit.description && (
            <span style={{ color: surface.descriptionColor }}> {benefit.description}</span>
          )}
        </div>
      </div>
    </li>
  )
}
