'use client'

import { EyeIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getRandomIntInclusive } from '../../(oversikt)/utils/getRandomInInclusive'
import { getTimeOfDayMultiplier } from '../../(oversikt)/utils/getTimeOfDayMultiplier'
import { getDayOfWeekMultiplier } from '../../(oversikt)/utils/getDayOfWeekMultiplier'
import type { SmartRealTimeActivityProps } from '@types'

export function SmartRealTimeActivity({
  baseViewers
}: SmartRealTimeActivityProps) {
  const [currentViewerCount, setCurrentViewerCount] =
    useState<number>(() => {
      const smartBase = Math.round(
        baseViewers *
          getTimeOfDayMultiplier() *
          getDayOfWeekMultiplier()
      )
      return Math.max(
        2,
        smartBase + getRandomIntInclusive(-1, 1)
      )
    })

  useEffect(() => {
    const intervalId = window.setInterval(
      () => {
        setCurrentViewerCount(prev =>
          Math.max(2, prev + (Math.random() > 0.55 ? 1 : -1))
        )
      },
      getRandomIntInclusive(8000, 22000)
    )

    return () => window.clearInterval(intervalId)
  }, [])

  const [isEntering, setIsEntering] = useState<boolean>(false)
  const isFirstRenderRef = useRef<boolean>(true)

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    let raf2: number | undefined
    const raf1 = requestAnimationFrame(() => {
      setIsEntering(true)
      raf2 = requestAnimationFrame(() => {
        setIsEntering(false)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [currentViewerCount])

  return (
    <div
      aria-live='polite'
      className='flex items-center gap-2 font-utekos-text-medium text-sm text-promo-foreground dark:text-dark-promo-foreground'
    >
      <EyeIcon className='size-5 rounded-full bg-promo-foreground dark:bg-dark-promo-foreground p-1 text-promo dark:text-dark-promo md:size-6' />
      <span
        className={[
          'transform font-utekos-text-medium transition-opacity duration-400 ease-out',
          isEntering ?
            'translate-y-2 opacity-0'
          : 'translate-y-0 opacity-100'
        ].join(' ')}
      >
        {currentViewerCount}
      </span>
      <span className='font-utekos-text-medium text-sm text-promo-foreground dark:text-dark-promo-foreground'>
        andre ser på dette produktet akkurat nå
      </span>
    </div>
  )
}
