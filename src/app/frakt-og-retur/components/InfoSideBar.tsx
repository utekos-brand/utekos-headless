// Path: src/app/frakt-og-retur/components/InfoSidebar.tsx
import BrandBadge from '@/components/BrandComponents/utils/BrandBadge'
import {
  BadgeCheck,
  Mail,
  Package,
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'

export function InfoSidebar() {
  return (
    <aside className='w-full lg:col-span-4'>
      {/* Ytre container for pattern og sticky oppførsel */}
      <div className='dark:bg-dark-foreground/5 sticky top-28 flex min-w-0 flex-col rounded-2xl bg-foreground/5 p-2'>
        {/* Indre kort med spesifikk merkefarge */}
        <div className='dark:border-dark-foreground  flex flex-col items-start rounded-xl border border-foreground bg-card p-6 text-card-foreground shadow-sm sm:p-8'>
          <h3 className='mb-8 text-left font-sans text-xl leading-tight font-semibold text-card-foreground'>
            Dine trygghetsgarantier
          </h3>

          <ul className='flex w-full flex-col gap-6'>
            <li className='flex items-start gap-4'>
              <div className='dark:bg-dark-muted dark:text-dark-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                <ShieldCheck
                  className='size-5'
                  strokeWidth={1.8}
                  aria-hidden='true'
                />
              </div>
              <div className='flex flex-col items-start'>
                <span className='font-sans text-base font-semibold text-card-foreground'>
                  14 dagers angrerett
                </span>
                <span className='font-utekos-text mt-1 text-left text-sm leading-relaxed text-card-foreground'>
                  Lovfestet trygghet fra du mottar varen.
                </span>
              </div>
            </li>

            <li className='flex items-start gap-4'>
              <div className='dark:bg-dark-muted dark:text-dark-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                <Package
                  className='size-5'
                  strokeWidth={1.8}
                  aria-hidden='true'
                />
              </div>
              <div className='flex flex-col items-start'>
                <span className='font-sans text-base font-semibold text-card-foreground'>
                  Fri frakt over 999 kr
                </span>
                <span className='font-utekos-text mt-1 text-left text-sm leading-relaxed text-card-foreground'>
                  Vi spanderer frakten på større bestillinger.
                </span>
              </div>
            </li>

            <li className='flex items-start gap-4'>
              <div className='dark:bg-dark-muted dark:text-dark-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                <BadgeCheck
                  className='size-5'
                  strokeWidth={1.8}
                  aria-hidden='true'
                />
              </div>
              <div className='flex flex-col items-start'>
                <span className='font-sans text-base font-semibold text-card-foreground'>
                  Retur
                </span>
                <address className='mt-1 not-italic'>
                  <span className='font-utekos-text text-left text-sm leading-relaxed text-card-foreground'>
                    Send en e-post til kundeservice@utekos.no, så
                    er du i gang.
                  </span>
                </address>
              </div>
            </li>
          </ul>

          <hr className='dark:border-dark-foreground my-8 w-full border-t border-foreground' />

          <div className='flex w-full flex-col items-start'>
            <h4 className='mb-4 text-left font-sans text-base font-semibold text-card-foreground'>
              Har du andre spørsmål?
            </h4>
            <BrandBadge
              asChild
              tone='commerce-primary'
              className='flex min-h-12 w-full items-center justify-center border border-current px-6 py-3 font-sans text-base font-bold shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110'
            >
              <Link
                href='/kontaktskjema'
                data-track='ShippingReturnsContactClick'
              >
                <Mail
                  className='mr-2 size-5'
                  aria-hidden='true'
                />
                Kontakt oss
              </Link>
            </BrandBadge>
          </div>
        </div>
      </div>
    </aside>
  )
}
