'use client'

import { NavigationProgress } from './NavigationProgress'
import { usePathname } from 'next/navigation'

type SiteChromeProps = {
  children: React.ReactNode
  header: React.ReactNode
  footer: React.ReactNode
}

function isDesignRoute(pathname: string | null) {
  if (!pathname) {
    return false
  }

  return (
    pathname === '/design' || pathname.startsWith('/design/')
  )
}

export function SiteChrome({
  children,
  header,
  footer
}: SiteChromeProps) {
  const pathname = usePathname()

  if (isDesignRoute(pathname)) {
    return children
  }

  return (
    <>
      <NavigationProgress />
      {header}
      <main>{children}</main>
      {footer}
    </>
  )
}
