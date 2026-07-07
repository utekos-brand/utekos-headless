// Path: src/app/skreddersy-varmen/components/ShippingAndReturnComponent.tsx
import Link from 'next/link'
import type { Route } from 'next'
import {
  Truck,
  RefreshCcw,
  Store,
  ArrowRight
} from 'lucide-react'

export function ShippingAndReturnComponent() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='border-foreground/10 bg-background rounded-xl border border-foreground/10 bg-background text-foreground shadow-sm'>
        <div className='divide-foreground/10 grid grid-cols-1 divide-y divide-foreground/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0'>
          <div className='flex items-start gap-3 p-4'>
            <Truck
              size={22}
              className='text-accent mt-0.5 shrink-0 text-accent drop-shadow-sm'
            />
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-foreground'>
                Rask levering 2–5 dager
              </p>
              <p className='/70 mt-0.5 text-xs leading-snug text-foreground/70'>
                Sendes samme dag. Fri frakt på denne varen.
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3 p-4'>
            <RefreshCcw
              size={22}
              className='text-accent mt-0.5 shrink-0 text-accent drop-shadow-sm'
            />
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-foreground'>
                14 dagers åpent kjøp
              </p>
              <p className='/70 mt-0.5 text-xs leading-snug text-foreground/70'>
                Rolig returfrist når varen er ubrukt.
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3 p-4'>
            <Store
              size={22}
              className='text-accent mt-0.5 shrink-0 text-accent drop-shadow-sm'
            />
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-foreground'>
                På lager i Bergen
              </p>
              <p className='/70 mt-0.5 text-xs leading-snug text-foreground/70'>
                Også via Intersport. Norsk garanti.
              </p>
            </div>
          </div>
        </div>

        <div className='border-foreground/10 bg-background/50 rounded-b-xl border-t border-foreground/10 bg-background/50 px-4 py-2.5'>
          <Link
            href={'/frakt-og-retur' as Route}
            data-track='SkreddersyVarmenFraktOgReturLink'
            className='group /60 hover:text-accent inline-flex items-center gap-1.5 text-xs font-medium text-foreground/60 transition-colors hover:text-accent'
          >
            Alt om frakt og retur
            <ArrowRight
              size={12}
              className='transition-transform group-hover:translate-x-0.5'
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
