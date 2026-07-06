'use client'

import { useEffect } from 'react'
import { animate, inView, stagger } from 'motion'

export function NbccMotionEnhancer() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-nbcc-page]')
    if (!root) return

    const animatedItems = Array.from(
      root.querySelectorAll<HTMLElement>('[data-nbcc-animate]:not([data-nbcc-hero])')
    )
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      animatedItems.forEach(item => {
        item.style.opacity = '1'
        item.style.transform = 'none'
      })
      return
    }

    const stopReveal = inView(
      root.querySelectorAll('[data-nbcc-reveal]'),
      element => {
        if (element instanceof HTMLElement) {
          element.style.willChange = 'transform, opacity'
        }

        const controls = animate(
          element,
          { opacity: [0, 1], y: [34, 0] },
          {
            duration: 0.65,
            delay: stagger(0.08),
            ease: [0.22, 1, 0.36, 1]
          }
        )

        controls.then(() => {
          if (element instanceof HTMLElement) {
            element.style.willChange = 'auto'
          }
        })

        return () => controls.stop()
      },
      { margin: '0px 0px -18% 0px', amount: 0.12 }
    )

    return () => {
      stopReveal()
      animatedItems.forEach(item => {
        item.style.willChange = 'auto'
      })
    }
  }, [])

  return null
}
