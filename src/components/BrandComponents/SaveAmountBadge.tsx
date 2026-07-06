import { Badge } from '@/components/ui/badge'

export const SaveAmountBadge = ({
  savingsAmount
}: {
  savingsAmount: number
}) => {
  return (
    <Badge
      variant='secondary'
      className='font-utekos-text px-7 py-6 text-base'
    >
      Spar {savingsAmount} kr
    </Badge>
  )
}
