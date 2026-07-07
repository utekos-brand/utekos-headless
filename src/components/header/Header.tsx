// Path: src/components/header/Header.tsx

import { Cart } from '@/components/cart/Cart'
import { HeaderSearch } from '@/components/header/HeaderSearch/HeaderSearch'
import type { MenuItem } from '@types'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { HeadphonesIcon } from 'lucide-react'
import { siteXGutterClassName } from '@/lib/layout/siteGutter'
import { cn } from '@/lib/utils/className'
import { ClientMobileMenu } from './ClientMobileMenu'

export default function Header({ menu }: { menu: MenuItem[] }) {
  return (
    <header className='top-0! z-50 w-full text-foreground'>
      <div
        className={cn(
          'relative mx-auto grid min-h-18 w-full grid-cols-[auto_1fr] items-center gap-3 py-2.5 lg:min-h-20 xl:min-h-22.5',
          siteXGutterClassName
        )}
      >
        <div className='flex min-w-0 items-center justify-start'>
          <Link
            href={'/' as Route}
            aria-label='Utekos - Til forsiden'
            data-track='HeaderLogoClick'
            className='flex h-14 items-center lg:h-16'
          >
            <Image
              src='/wordmarks/WordmarkBlack.svg'
              alt='Utekos'
              width={300}
              height={73}
              className='h-7 w-auto sm:h-8 lg:h-9 xl:h-10 dark:hidden'
            />
            <Image
              src='/wordmarks/WordmarkWhite.svg'
              alt='Utekos'
              width={300}
              height={73}
              className='hidden h-7 w-auto sm:h-8 lg:h-9 xl:h-10 dark:block'
            />
          </Link>
        </div>

        <div className='flex min-w-0 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3'>
          <HeaderSearch variant='nav' />

          <Link
            href={'/kontaktskjema' as Route}
            data-track='HeaderCustomerServiceClick'
            className='focus-visible:ring-ring hidden h-11 min-w-31 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-foreground transition outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring md:inline-flex dark:hover:bg-accent'
          >
            <HeadphonesIcon className='size-4' aria-hidden />
            <span>Kundeservice</span>
          </Link>

          <Cart
            showLabel
            className='hover:bg-accent h-11 min-w-29 rounded-md border-transparent bg-transparent px-3 text-foreground hover:bg-accent hover:text-accent-foreground'
          />

          <ClientMobileMenu menu={menu} />
        </div>
      </div>
    </header>
  )
}
