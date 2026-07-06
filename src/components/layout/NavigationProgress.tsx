'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const NAVIGATION_PROGRESS_TIMEOUT_MS = 8000

function getInternalNavigationUrl(event: MouseEvent) {
  if (
    event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  ) {
    return null
  }

  const target = event.target
  if (!(target instanceof Element)) return null

  const anchor = target.closest('a[href]')
  if (!(anchor instanceof HTMLAnchorElement)) return null
  if (anchor.target && anchor.target !== '_self') return null
  if (anchor.hasAttribute('download')) return null

  const nextUrl = new URL(anchor.href, window.location.href)
  if (nextUrl.origin !== window.location.origin) return null

  const currentUrl = new URL(window.location.href)
  const isSamePath =
    nextUrl.pathname === currentUrl.pathname
    && nextUrl.search === currentUrl.search

  if (isSamePath) return null

  return nextUrl
}

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const clearPendingId = window.setTimeout(() => {
      setIsPending(false)
    }, 0)

    return () => window.clearTimeout(clearPendingId)
  }, [pathname, search])

  useEffect(() => {
    if (!isPending && timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      return
    }

    if (!isPending) return

    timeoutRef.current = setTimeout(() => {
      setIsPending(false)
      timeoutRef.current = null
    }, NAVIGATION_PROGRESS_TIMEOUT_MS)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isPending])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!getInternalNavigationUrl(event)) return
      setIsPending(true)
    }

    const clearPending = () => setIsPending(false)

    document.addEventListener('click', handleClick)
    window.addEventListener('pageshow', clearPending)
    window.addEventListener('popstate', clearPending)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('pageshow', clearPending)
      window.removeEventListener('popstate', clearPending)
    }
  }, [])

  return (
    <div
      data-navigation-progress
      aria-hidden={!isPending}
      className='pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden'
    >
      <span className='sr-only'>
        {isPending ? 'Laster siden' : ''}
      </span>
      <span
        className={
          isPending ?
            'block h-full origin-left scale-x-100 bg-primary transition-transform duration-700 ease-out'
          : 'block h-full origin-left scale-x-0 bg-primary transition-transform duration-150 ease-in'
        }
      />
    </div>
  )
}
