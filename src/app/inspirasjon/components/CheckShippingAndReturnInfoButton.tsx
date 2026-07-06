import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'

export const CheckShippingAndReturnInfoButton = () => {
  return (
    <Button
      variant='outline'
      size='lg'
      className='mb-2 bg-[#5B77B0] px-8 py-4 text-foreground hover:bg-[#5B77B0]/80'
    >
      <Link href='/frakt-og-retur'>Om frakt og retur</Link>
      <ArrowRightIcon className='transition-transform duration-200 group-hover:translate-x-0.5' />
    </Button>
  )
}
