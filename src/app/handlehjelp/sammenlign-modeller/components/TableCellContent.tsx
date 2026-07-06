// Path: src/app/handlehjelp/sammenlign-modeller/components/TableCellContent.tsx
import { Check } from 'lucide-react'

export function TableCellContent({
  value
}: {
  value: string | boolean
}) {
  if (typeof value === 'boolean') {
    return value ?
        <span className='dark:bg-dark-primary dark:text-dark-background inline-flex size-8 items-center justify-center rounded-full bg-primary text-background'>
          <Check className='size-4' aria-hidden='true' />
          <span className='sr-only'>Ja</span>
        </span>
      : <span className='dark:text-dark-muted-foreground text-sm text-muted-foreground'>
          Nei
        </span>
  }

  return (
    <span className='leading-text-paragraph text-sm text-card-foreground'>
      {value}
    </span>
  )
}
