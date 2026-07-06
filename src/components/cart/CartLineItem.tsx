// Path: src/components/cart/CartLineItem/CartLineItem.tsx
'use client'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button, buttonVariants } from '@/components/ui/button'
import { useCartLine } from '@/hooks/useCartLine'
import { CartMutationContext } from '@/lib/context/CartMutationContext'
import { cartStore } from '@/lib/state/cartStore'
import { cn } from '@/lib/utils/className'
import { formatNOK } from '@/lib/utils/formatters/formatNOK'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AlertDialogTitle } from './AlertDialogen'
import { Activity } from 'react'

interface CartLineItemProps {
  lineId: string
}

export const CartLineItem = ({ lineId }: CartLineItemProps) => {
  const line = useCartLine(lineId)
  const cartActor = CartMutationContext.useActorRef()
  const [localQuantity, setLocalQuantity] = useState(
    line?.quantity ?? 1
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (line && !isDeleting) {
      setLocalQuantity(line.quantity)
    }
  }, [line, isDeleting])

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [])

  if (!line) {
    return null
  }

  const handleUpdateQuantity = (newQuantity: number) => {
    setLocalQuantity(newQuantity)

    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }

    if (newQuantity === 0) {
      setIsDeleting(true)
      cartActor.send({
        type: 'REMOVE_LINE',
        input: { lineId: line.id }
      })
    } else {
      updateTimerRef.current = setTimeout(() => {
        cartActor.send({
          type: 'UPDATE_LINE',
          input: { lineId: line.id, quantity: newQuantity }
        })
      }, 300)
    }
  }

  const handleRemoveLine = () => {
    setIsDeleting(true)
    setLocalQuantity(0)
    cartActor.send({
      type: 'REMOVE_LINE',
      input: { lineId: line.id }
    })
  }

  const productTitle: string =
    line.merchandise.product?.title || 'Produkt'
  const productHandle: string = line.merchandise.product?.handle

  const variantId: string = line.merchandise.id
  const baseUrl: string =
    productHandle ? `/produkter/${productHandle}` : '/'
  const variantQuery: string | number =
    variantId ? `?variant=${encodeURIComponent(variantId)}` : ''

  const productUrl: string = `${baseUrl}${variantQuery}` as Route

  const variantTitle: string = line.merchandise.title || ''
  const imageUrl: string | undefined =
    line.merchandise.image?.url
  const [color, size]: string[] = variantTitle.split(' / ')
  const basePrice: number =
    parseFloat(line.cost?.totalAmount?.amount || '0') /
    line.quantity
  const displayPrice: number = basePrice * localQuantity

  return (
    <div
      className={cn('flex gap-4 transition-all duration-200', {
        'pointer-events-none opacity-50': isDeleting
      })}
    >
      <Link
        href={productUrl as Route}
        onClick={() => cartStore.send({ type: 'CLOSE' })}
      >
        <div className='w-24 shrink-0'>
          <AspectRatio
            ratio={1 / 1}
            className='overflow-hidden rounded-lg border border-border bg-muted'
          >
            {imageUrl ?
              <Image
                src={imageUrl}
                alt={productTitle}
                fill
                className='object-cover'
                sizes='96px'
              />
            : <div className='flex size-full items-center justify-center text-muted-foreground'>
                <span className='text-xs'>Ingen bilde</span>
              </div>
            }
          </AspectRatio>
        </div>
      </Link>

      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='relative'>
          <div className='min-w-0 pr-8'>
            <Link
              href={productUrl as Route}
              onClick={() => cartStore.send({ type: 'CLOSE' })}
            >
              <h3 className='text-sm font-medium wrap-break-word text-foreground hover:underline'>
                {productTitle}
              </h3>
            </Link>
            {color && size && (
              <p className='mt-1 text-xs text-muted-foreground'>
                {color} / {size}
              </p>
            )}
          </div>
          <div className='absolute top-0 -right-2 md:right-0'>
            <AlertDialog>
              <AlertDialogTrigger
                disabled={isDeleting}
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                    size: 'icon'
                  }),
                  'size-6 p-0'
                )}
              >
                <Trash2 className='size-4 text-destructive' />
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Er du sikker?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Vil du fjerne {productTitle} fra handlekurven
                    din?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Nei, avbryt
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveLine}
                    data-track='CartRemoveItem'
                    variant='destructive'
                    data-track-data={JSON.stringify({
                      product: productTitle,
                      variant: variantTitle,
                      price: basePrice,
                      quantity: localQuantity,
                      total: displayPrice
                    })}
                  >
                    Ja, fjern produkt
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className='mt-auto flex flex-col items-start gap-2 pt-2 md:flex-row md:items-center md:justify-between md:gap-4'>
          <div className='flex items-center gap-1'>
            <Activity>
              <Button
                size='icon'
                variant='secondary'
                className='size-7 rounded-md transition-transform active:scale-90'
                onClick={() =>
                  handleUpdateQuantity(localQuantity - 1)
                }
                disabled={localQuantity <= 1 || isDeleting}
              >
                <Minus className='size-3' />
              </Button>
            </Activity>
            <span className='min-w-7 text-center text-sm font-medium text-foreground tabular-nums transition-all duration-100'>
              {localQuantity}
            </span>
            <Activity>
              <Button
                size='icon'
                variant='secondary'
                className='size-7 rounded-md transition-transform active:scale-90'
                onClick={() =>
                  handleUpdateQuantity(localQuantity + 1)
                }
                disabled={isDeleting || localQuantity >= 99}
              >
                <Plus className='size-3' />
              </Button>
            </Activity>
          </div>
          <span className='text-sm font-medium whitespace-nowrap text-foreground tabular-nums'>
            {formatNOK(displayPrice)}
          </span>
        </div>
      </div>
    </div>
  )
}
