'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type LoadWhenVisibleProps = {
  children: ReactNode
  fallback: ReactNode
  rootMargin?: string
}

export function LoadWhenVisible({
  children,
  fallback,
  rootMargin = '200px 0px'
}: LoadWhenVisibleProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    if (shouldLoad) {
      return
    }

    const root = rootRef.current

    if (!root || !('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => {
        setShouldLoad(true)
      }, 0)

      return () => {
        window.clearTimeout(fallbackTimer)
      }
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) {
          return
        }

        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin }
    )

    observer.observe(root)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, shouldLoad])

  return <div ref={rootRef}>{shouldLoad ? children : fallback}</div>
}
