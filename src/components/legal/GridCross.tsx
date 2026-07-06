// Path: src/components/legal/GridCross.tsx
import { cn } from '@/lib/utils/className'
import type { GridCrossProps } from '@types'

export function GridCross({ className }: GridCrossProps) {
  return (
    <div
      className={cn('pointer-events-none absolute z-10', className)}
      aria-hidden='true'
    >
      <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
        <line
          x1='16'
          y1='0'
          x2='16'
          y2='32'
          stroke='rgb(255 255 255 / 0.1)'
          strokeWidth='1'
        />
        <line
          x1='0'
          y1='16'
          x2='32'
          y2='16'
          stroke='rgb(255 255 255 / 0.1)'
          strokeWidth='1'
        />
      </svg>
    </div>
  )
}
