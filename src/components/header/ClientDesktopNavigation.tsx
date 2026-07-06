'use client'

import type { MenuItem } from '@types'
import dynamic from 'next/dynamic'
import { useSyncExternalStore } from 'react'

const DESKTOP_NAVIGATION_QUERY = '(min-width: 1024px)'

const DesktopNavigation = dynamic(
  () => import('@/components/header/DesktopNavigation').then(mod => mod.DesktopNavigation),
  { ssr: false }
)

const subscribeToDesktopNavigationQuery = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') return () => {}

  const mediaQueryList = window.matchMedia(DESKTOP_NAVIGATION_QUERY)
  mediaQueryList.addEventListener('change', onStoreChange)

  return () => {
    mediaQueryList.removeEventListener('change', onStoreChange)
  }
}

const getDesktopNavigationSnapshot = () =>
  typeof window !== 'undefined' && window.matchMedia(DESKTOP_NAVIGATION_QUERY).matches

const getServerNavigationSnapshot = () => false

export function ClientDesktopNavigation({ menu }: { menu: MenuItem[] }) {
  const isDesktopNavigationViewport = useSyncExternalStore(
    subscribeToDesktopNavigationQuery,
    getDesktopNavigationSnapshot,
    getServerNavigationSnapshot
  )

  if (!isDesktopNavigationViewport) return null

  return <DesktopNavigation menu={menu} />
}
