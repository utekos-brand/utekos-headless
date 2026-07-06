import { KlarnaLogo } from '@/components/payments/KlarnaLogo'
import { MastercardLogo } from '@/components/payments/MastercardLogo'
import { VippsLogo } from '@/components/payments/VippsLogo'
import { VisaLogo } from '@/components/payments/VisaLogo'
export const paymentLogos = [
  {
    name: 'Klarna',
    Component: KlarnaLogo,
    className: 'h-7 w-auto sm:h-8'
  },
  {
    name: 'Vipps',
    Component: VippsLogo,
    className: 'h-5 w-auto sm:h-6'
  },
  {
    name: 'Visa',
    Component: VisaLogo,
    className: 'h-6 w-auto sm:h-7'
  },
  {
    name: 'Mastercard',
    Component: MastercardLogo,
    className: 'h-6 w-auto sm:h-7'
  }
] as const
