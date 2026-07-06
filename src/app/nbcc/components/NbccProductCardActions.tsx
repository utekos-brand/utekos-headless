'use client'

import { MoveRightIcon } from '@/components/animate-icons/icons/move-right'
import { Button } from '@/components/ui/button'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { cartStore } from '@/lib/state/cartStore'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { NbccProductCardActionsProps } from '../types'

export function NbccProductCardActions({
  variants,
  href,
  productTitle,
  tracking
}: NbccProductCardActionsProps) {
  const [selectedLabel, setSelectedLabel] = useState(
    variants[0]?.label ?? ''
  )

  const cartActor = CartMutationContext.useActorRef()
  const isPending = CartMutationContext.useSelector(state =>
    state.matches('mutating')
  )
  const lastError = CartMutationContext.useSelector(
    state => state.context.error
  )

  useEffect(() => {
    if (lastError) {
      toast.error(lastError)
    }
  }, [lastError])

  const selectedVariant = variants.find(
    v => v.label === selectedLabel
  )
  const isAvailable = selectedVariant?.availableForSale ?? false
  const price =
    selectedVariant?.price ?? variants[0]?.price ?? ''

  const handleAddToCart = () => {
    if (!selectedVariant?.variantId) {
      toast.error('Velg en størrelse først.')
      return
    }
    if (!isAvailable) {
      toast.warning('Denne størrelsen er dessverre utsolgt.')
      return
    }
    cartActor.send({
      type: 'ADD_LINES',
      input: [
        { variantId: selectedVariant.variantId, quantity: 1 }
      ]
    })
    toast.success(
      `${productTitle} (${selectedVariant.label}) er lagt i handlekurven!`
    )
    cartStore.send({ type: 'OPEN' })
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Size selector */}
      <div>
        <p className='mb-2 text-xs font-medium tracking-widest text-foreground uppercase'>
          Størrelse
        </p>
        <div className='flex flex-wrap gap-2'>
          {variants.map(v => (
            <button
              key={v.label}
              type='button'
              onClick={() => setSelectedLabel(v.label)}
              disabled={!v.availableForSale}
              className={[
                'rounded-md border px-3 py-1.5 text-sm font-medium transition-all',
                v.label === selectedLabel ?
                  'border-background bg-foreground text-background border-background bg-foreground text-background'
                : !v.availableForSale ?
                  'border-foreground/10 /25 cursor-not-allowed border-foreground/10 text-foreground/25 line-through'
                : 'border-foreground/40 /80 hover:border-foreground hover:text-foreground border-foreground/40 text-foreground/80 hover:border-foreground hover:text-foreground'
              ].join(' ')}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className='flex items-center justify-between'>
        <span className='text-xl font-semibold text-foreground'>
          {price}
        </span>
        <span className='border-accent-foreground/2020 bg-accent text-accent-foreground rounded-full border px-2 py-0.5 text-xs'>
          NBCC-rabatt i kassen
        </span>
      </div>

      {/* CTAs */}
      <div className='flex flex-col gap-2'>
        <Button
          onClick={handleAddToCart}
          disabled={isPending || !isAvailable}
          variant='default'
          className='h-11 w-full rounded-md'
        >
          {isPending ?
            <Loader2 className='size-4 animate-spin' />
          : 'Legg i handlekurv'}
        </Button>
        <Button
          asChild
          variant='secondary'
          className='h-9 w-full rounded-md transition-all duration-200'
        >
          <Link
            href={href}
            data-track='NbccProductCardCtaClick'
            data-track-data={JSON.stringify(tracking)}
          >
            Produktside
            <MoveRightIcon size={16} animateOnHover='default' />
          </Link>
        </Button>
      </div>
    </div>
  )
}
