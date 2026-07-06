// Path: src/components/cart/CartHeader.tsx

import { Button } from '@/components/ui/button'
import { cartStore } from '@/lib/state/cartStore'
import { XMarkIcon } from '@heroicons/react/24/outline'

export const CartHeader = () => (
  <div className='flex shrink-0 items-center justify-between border-b px-6 py-4'>
    <h2 className='text-lg font-semibold'>Handlekurv</h2>
    <Button
      size='icon'
      onClick={() => cartStore.send({ type: 'CLOSE' })}
      className='dark:bg-dark-background dark:hover:bg-dark-background/80 h-10 w-10 border border-neutral-600 bg-background p-0 text-foreground hover:bg-background/80'
    >
      <XMarkIcon className='h-5 w-5' />
      <span className='sr-only'>Lukk handlekurven</span>
    </Button>
  </div>
)
