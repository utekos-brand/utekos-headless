import { VippsLogo } from '@/components/payments/VippsLogo'
import { KlarnaLogo } from '@/components/payments/KlarnaLogo'

export function PaymentIcons() {
  return (
    <div className='mt-2 flex items-center justify-center gap-3 opacity-85 transition-opacity duration-300 group-hover:opacity-100'>
      <VippsLogo className='h-5 w-auto' />
      <KlarnaLogo className='h-5 w-auto' />
    </div>
  )
}
