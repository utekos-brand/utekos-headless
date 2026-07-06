// Path: src/components/jsx/OptionButton.tsx

import type { OptionButtonProps } from '@types'

export function OptionButton({
  isSelected,
  onClick,
  children
}: OptionButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      role='radio'
      aria-checked={isSelected}
      data-selected={isSelected}
      className='border-card-foreground/24  hover:border-card-foreground/45 focus-visible:ring-card-foreground/45 data-[selected=true]:border-secondary data-[selected=true]:bg-ceramic data-[selected=true]:text-secondary data-[selected=true]:ring-secondary/55 data-[selected=true]:[&_span]:text-secondary flex w-full cursor-pointer items-center justify-between rounded-2xl border border-card-foreground/24 bg-card p-4 text-left text-card-foreground transition-all duration-200 ease-in-out hover:border-card-foreground/45 focus-visible:ring-2 focus-visible:ring-card-foreground/45 focus-visible:outline-none data-[selected=true]:shadow-[0_12px_28px_-22px_color-mix(in_oklch,var(--secondary)_70%,transparent)] data-[selected=true]:ring-2'
    >
      {children}
    </button>
  )
}
