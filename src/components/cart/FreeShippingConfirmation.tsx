import { CheckCircleIcon } from 'lucide-react'
export function FreeShippingConfirmation() {
  return (
    <div
      className='animate-fade-in-down p-6 text-sm'
      style={{ animationDuration: '0.5s' }}
    >
      <div className='flex items-center justify-center gap-3 rounded-lg border border-green-500/30 bg-green-900/20 px-4 py-3 text-green-400'>
        <CheckCircleIcon className='h-5 w-5' />
        <span className='font-semibold'>
          Gratulerer, du har fått fri frakt!
        </span>
      </div>
    </div>
  )
}
