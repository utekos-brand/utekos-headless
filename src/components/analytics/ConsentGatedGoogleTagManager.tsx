'use client'

import { useEffect, useState } from 'react'
import { runAfterPageSettles } from '@/lib/browser/runAfterPageSettles'
import { GoogleTagManagerScript } from './GoogleTagManagerScript'

export function ConsentGatedGoogleTagManager() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    return runAfterPageSettles(() => {
      setShouldLoad(true)
    })
  }, [])

  return shouldLoad ? <GoogleTagManagerScript /> : null
}
