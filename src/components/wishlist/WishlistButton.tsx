'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils/className'
import { Heart, ShieldCheck } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { buildCustomerLoginHref } from './buildCustomerLoginHref'

type WishlistButtonProps = {
  productTitle: string
  returnTo: string
  variant?: 'icon' | 'labelled'
  className?: string
}

export function WishlistButton({
  productTitle,
  returnTo,
  variant = 'icon',
  className
}: WishlistButtonProps) {
  const loginHref = buildCustomerLoginHref({
    mode: 'login',
    returnTo
  }) as Route
  const createAccountHref = buildCustomerLoginHref({
    mode: 'create',
    returnTo
  }) as Route
  const isLabelled = variant === 'labelled'

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type='button'
            variant='ghost'
            size={isLabelled ? 'default' : 'icon-lg'}
            aria-label={`Legg ${productTitle} til i ønskelisten`}
            className={cn(
              'border border-white/70 bg-cyan-500 text-[#172744] shadow-[0_12px_30px_-16px_rgba(0,0,0,0.85)] hover:bg-cyan-400 hover:text-[#172744] focus-visible:border-white focus-visible:ring-white/70',
              isLabelled ?
                'h-11 rounded-full px-4 text-sm font-semibold'
              : 'size-12 rounded-2xl',
              className
            )}
          />
        }
      >
        <Heart
          className='size-5 fill-current stroke-[2.25]'
          aria-hidden='true'
        />
        {isLabelled ?
          <span>Ønskeliste</span>
        : <span className='sr-only'>
            Legg {productTitle} til i ønskelisten
          </span>
        }
      </DialogTrigger>

      <DialogContent className='overflow-hidden p-0 sm:max-w-lg'>
        <div className='bg-card px-6 pt-7 pb-6 text-card-foreground sm:px-8'>
          <div className='mb-5 flex size-14 items-center justify-center rounded-2xl bg-cyan-500 text-[#172744]'>
            <Heart
              className='size-7 fill-current stroke-[2.25]'
              aria-hidden='true'
            />
          </div>
          <DialogHeader className='pr-8'>
            <DialogTitle className='text-2xl leading-tight font-semibold text-card-foreground'>
              Logg inn for å legge til på ønskeliste
            </DialogTitle>
            <DialogDescription className='text-base leading-7 text-card-foreground/80 dark:text-card-foreground/80'>
              For å lagre varer til senere må du være logget inn
              på kontoen din.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='space-y-5 bg-popover px-6 pt-1 pb-7 text-popover-foreground sm:px-8'>
          <div className='dark:border-dark-border dark:bg-dark-muted/30 flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4'>
            <ShieldCheck
              className='mt-0.5 size-5 shrink-0 text-sidebar-primary'
              aria-hidden='true'
            />
            <p className='dark:text-dark-muted-foreground text-sm leading-6 text-muted-foreground'>
              Innlogging og nye kontoer håndteres sikkert av
              Shopify. Du kan bruke e-post, Facebook eller Google
              når det er tilgjengelig for kontoen din.
            </p>
          </div>

          <DialogFooter className='grid gap-3 sm:grid-cols-2'>
            <Button
              asChild
              variant='commerce-primary'
              size='lg'
              className='min-h-12 rounded-full bg-cyan-500 px-6 text-base text-[#172744] shadow-sm hover:bg-cyan-400 hover:text-[#172744] dark:bg-cyan-500 dark:text-[#172744] dark:hover:bg-cyan-400 dark:hover:text-[#172744]'
            >
              <Link href={loginHref}>Logg inn</Link>
            </Button>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='min-h-12 rounded-full px-6 text-base'
            >
              <Link href={createAccountHref}>Opprett konto</Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
