// Path: src/components/header/MobileMenu/MobileMenuItem.tsx

import Link from 'next/link'
import { normalizeShopifyUrl } from '@/lib/helpers/normalizers/normalizeShopifyUrl'
import type { MenuItem } from '@types'
import type { Route } from 'next'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { ChevronRight } from 'lucide-react'
import { SubMenuItem } from '@/components/header/MobileMenu/SubMenuItem'

export function MobileMenuItem({ item }: { item: MenuItem }) {
  const hasSubMenu = item.items && item.items.length > 0

  if (!hasSubMenu) {
    return (
      <Link
        href={normalizeShopifyUrl(item.url) as Route}
        className='group border-cloud-dancer/10 bg-cloud-dancer/[0.055] hover:border-cloud-dancer/18 hover:bg-cloud-dancer/[0.075] focus-visible:ring-cloud-dancer/38 relative flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-foreground transition-[background,border-color,transform] focus-visible:ring-2 active:scale-[0.99]'
      >
        <div className='absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 [background:radial-gradient(120%_120%_at_50%_0%,color-mix(in_oklab,var(--cloud-dancer)_12%,transparent),transparent_65%)] group-active:opacity-100' />
        <div className='relative flex min-w-0 items-center gap-3'>
          <span className='truncate text-[15px] leading-[1.2] font-semibold tracking-[-0.01em]'>
            {item.title}
          </span>
        </div>

        <ChevronRight className='/60 relative size-5 text-foreground/60 transition-transform duration-200 group-active:translate-x-0.5' />
      </Link>
    )
  }

  return (
    <AccordionItem value={item.title} className='border-none'>
      <AccordionTrigger className='group border-cloud-dancer/10 bg-cloud-dancer/[0.055] hover:border-cloud-dancer/18 hover:bg-cloud-dancer/[0.075] focus-visible:ring-cloud-dancer/38 data-[state=open]:border-very-peri/34 data-[state=open]:bg-cloud-dancer/[0.085] relative flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-foreground transition-[background,border-color] hover:no-underline focus-visible:ring-2'>
        <div className='absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 [background:radial-gradient(120%_120%_at_50%_0%,color-mix(in_oklab,var(--very-peri)_16%,transparent),transparent_70%)] group-data-[state=open]:opacity-100' />
        <div className='relative flex min-w-0 items-center gap-3'>
          <span className='truncate text-[15px] leading-[1.2] font-semibold tracking-[-0.01em]'>
            {item.title}
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className='pt-2 pb-0'>
        <div className='border-cloud-dancer/10 dark:bg-dark-background/54 rounded-2xl border bg-background/54 p-2 backdrop-blur'>
          <div className='space-y-1.5'>
            {item.items!.map(subItem => (
              <SubMenuItem key={subItem.title} item={subItem} />
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
