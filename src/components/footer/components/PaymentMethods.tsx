import { paymentLogos } from '@/components/footer/utils/paymentsLogos'
import { cn } from '@/lib/utils'

export function PaymentMethods() {
  return (
    <div className='mt-12 border-t border-border  pt-8'>
      <ul
        aria-label='Betalingsmetoder: Klarna, Vipps, Visa og Mastercard'
        className='mx-auto grid max-w-2xl grid-cols-2 overflow-hidden rounded-xl border border-sidebar-foreground/35 border-sidebar-foreground/35 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--sidebar-foreground)_14%,transparent),color-mix(in_oklch,var(--sidebar)_90%,var(--background)_10%))] shadow-[inset_0_1px_0_color-mix(in_oklch,var(--sidebar-foreground)_24%,transparent)] sm:grid-cols-4'
      >
        {paymentLogos.map(({ name, Component, className }, index) => (
          <li
            key={name}
            aria-label={name}
            className={cn(
              'flex min-h-11 items-center justify-center px-2 py-2 sm:min-h-12',
              index % 2 === 0 && 'border-r border-sidebar-foreground/24 border-sidebar-foreground/24',
              index < 2 && 'border-b border-sidebar-foreground/24 border-sidebar-foreground/24 sm:border-b-0',
              index < 3 && 'sm:border-r sm:border-sidebar-foreground/24 sm:border-sidebar-foreground/24'
            )}
          >
            <Component aria-hidden='true' className={className} />
          </li>
        ))}
      </ul>
    </div>
  )
}
