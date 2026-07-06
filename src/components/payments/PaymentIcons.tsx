import PaymentIconsSvg from '@public/logo/PaymentIcons.svg'
import Image from 'next/image'

export function PaymentIcons() {
  return (
    <div
      aria-label='Betalingsmetoder: Vipps, Visa og Klarna'
      role='img'
      className='flex items-center justify-center'
    >
      <Image
        src={PaymentIconsSvg}
        alt=''
        width={600}
        height={113}
        aria-hidden='true'
        className='h-10 w-auto object-contain sm:h-11'
      />
    </div>
  )
}
