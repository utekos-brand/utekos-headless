import { CheckIcon } from '@heroicons/react/24/outline'
export function TrustIndicators() {
  return (
    <article className='bg-card border-t border-slate-100 py-8'>
      <div className='container mx-auto px-4'>
        <div className='leading-text-paragraph mx-auto flex w-fit flex-col items-start gap-4 text-sm tracking-[-0.01em] text-foreground md:flex-row md:gap-8'>
          <div className='flex items-center gap-2'>
            <CheckIcon className='text-primary size-4' />
            <span>Rask levering</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckIcon className='text-primary size-4' />
            <span>Fri frakt over 999 kr</span>
          </div>
          <div className='flex items-center gap-2'>
            <CheckIcon className='text-primary size-4' />
            <span>Enkel retur</span>
          </div>
        </div>
      </div>
    </article>
  )
}
