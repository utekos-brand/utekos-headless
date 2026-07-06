import { Badge } from '@/components/ui/badge'
import { StarIcon } from 'lucide-react'

const BadgeWithIcon = () => {
  return (
    <Badge>
      <StarIcon className='size-3' />
      With Icon
    </Badge>
  )
}

export default BadgeWithIcon
