// Path: src/app/kontaktskjema/Buttons/SupportPageButton.tsx

'use client'
import type { ComponentProps } from 'react'
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import { cn } from '@/lib/utils/className'
import { useCtaMotion } from '@/app/kontaktskjema/utils/useCtaMotion'

type Props = ComponentProps<'button'> & {
  isBusy?: boolean
}

export function SupportPageButton({ isBusy, className, children, ...props }: Props) {
  const ref = useCtaMotion<HTMLButtonElement>()
  return (
    <BrandBadge
      asChild
      backgroundColor='var(--primary)'
      textColor='var(--background)'
      className={cn(
        'min-h-12 w-full select-none border border-primary/20 border-primary/20 px-6 py-3 text-base leading-4 font-semibold tracking-normal shadow-[0_16px_36px_-26px_rgba(232,178,66,0.72)] transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:ring-3 focus-visible:ring-primary/35 focus-visible:ring-primary/35 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60',
        className
      )}
    >
      <button ref={ref} aria-busy={isBusy || undefined} {...props}>
        <span aria-live='polite'>{children}</span>
      </button>
    </BrandBadge>
  )
}
