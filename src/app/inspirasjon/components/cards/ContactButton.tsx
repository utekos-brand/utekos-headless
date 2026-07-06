import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from 'lucide-react'


const ButtonIconHover = () => {
  return (
    <Button className='group'>
      Kontakt oss
      <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
    </Button>
  )
}

export default ButtonIconHover
