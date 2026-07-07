import { Separator } from '@/components/ui/separator'

interface EggplantSeparatorListProps {
  EggplantHEX: '2C2242'
  EggplantPMS: '2119 C'
  EggplantCMYK: '90/90/40/50'
}

export function EggplantSeparatorList({
  EggplantHEX,
  EggplantPMS,
  EggplantCMYK
}: EggplantSeparatorListProps) {
  return (
    <div className='flex w-full max-w-sm flex-col gap-2 text-sm'>
      <dl className='flex items-center justify-between'>
        <dt>HEX</dt>
        <dd className='text-foreground/90 text-foreground/90'>#{EggplantHEX}</dd>
      </dl>
      <Separator />
      <dl className='flex items-center justify-between'>
        <dt>PMS</dt>
        <dd className='text-foreground/90 text-foreground/90'>{EggplantPMS}</dd>
      </dl>
      <Separator />
      <dl className='flex items-center justify-between'>
        <dt>CMYK</dt>
        <dd className='text-foreground/90 text-foreground/90'>{EggplantCMYK}</dd>
      </dl>
    </div>
  )
}
