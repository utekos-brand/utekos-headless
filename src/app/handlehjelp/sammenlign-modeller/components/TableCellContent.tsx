import { Check } from 'lucide-react'
import { compareModelsTheme } from '../utils/compareModelsTheme'

export function TableCellContent({
  value
}: {
  value: string | boolean
}) {
  if (typeof value === 'boolean') {
    return value ?
        <span className={compareModelsTheme.checkIcon}>
          <Check className='size-4' aria-hidden='true' />
          <span className='sr-only'>Ja</span>
        </span>
      : <span className={compareModelsTheme.checkNegative}>Nei</span>
  }

  return (
    <span className='leading-text-paragraph text-sm text-card-foreground'>
      {value}
    </span>
  )
}
