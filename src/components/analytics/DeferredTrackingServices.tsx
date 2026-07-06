'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { runAfterPageSettles } from '@/lib/browser/runAfterPageSettles'

const DeferredTrackingBundle = dynamic(
  () => import('@/components/analytics/DeferredTrackingBundle').then(module => module.DeferredTrackingBundle),
  {
    ssr: false
  }
)

export function DeferredTrackingServices() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    return runAfterPageSettles(() => {
      setShouldLoad(true)
    })
  }, [])

  return shouldLoad ? <DeferredTrackingBundle /> : null
}
