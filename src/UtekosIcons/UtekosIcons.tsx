import type { LucideProps } from 'lucide-react'
import CottageIcon from './cottage_24dp_F0EEE9_FILL0_wght400_GRAD0_opsz24.svg'

export default function Cottage({
  className,
  ...props
}: LucideProps) {
  return <CottageIcon className={className} {...props} />
}
