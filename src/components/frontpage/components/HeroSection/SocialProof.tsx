import { CardHappyCustomers } from '@/app/inspirasjon/components/cards/CardHappyCustomers'
import { CardSafeShopping } from '@/app/inspirasjon/components/cards/CardSafeShopping'
import { CardFastDelivery } from '@/app/inspirasjon/components/cards/CardFastDelivery'

export function SocialProof() {
  return (
    <div className='container mx-auto grid max-w-7xl auto-rows-fr grid-cols-1 items-stretch gap-4 px-4 py-8 *:h-full sm:grid-cols-2 sm:py-12 sm:[&>*:last-child]:col-span-2 lg:grid-cols-3 lg:py-16 lg:[&>*:last-child]:col-span-1'>
      <CardFastDelivery />
      <CardHappyCustomers />
      <CardSafeShopping />
    </div>
  )
}