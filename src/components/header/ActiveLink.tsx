// Path: src/components/header/ActiveLink.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils/className'

import type { Route } from 'next'
import type { ComponentProps } from 'react'

type ActiveLinkProps = Omit<
  ComponentProps<typeof Link>,
  'href'
> & { children: React.ReactNode; href: Route }

export function ActiveLink({
  href,
  className,
  children,
  ...props
}: ActiveLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        navigationMenuTriggerStyle(),
        'text-sidebar-foreground dark:text-dark-sidebar-foreground hover:bg-sidebar-accent dark:hover:bg-dark-sidebar-accent hover:text-sidebar-accent-foreground dark:hover:text-dark-sidebar-accent-foreground focus-visible:ring-sidebar-ring dark:focus-visible:ring-dark-sidebar-ring data-[state=open]:bg-sidebar-accent dark:data-[state=open]:bg-dark-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:data-[state=open]:text-dark-sidebar-accent-foreground',
        className,
        isActive &&
          'bg-sidebar-accent dark:bg-dark-sidebar-accent text-sidebar-accent-foreground dark:text-dark-sidebar-accent-foreground'
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
