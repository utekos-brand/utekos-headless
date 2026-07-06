import { useEffect, useRef } from 'react'
import { animate, inView, stagger } from 'motion'

export function useSocialProofAnimations(options: { enabled?: boolean } = { enabled: true }) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root || !options.enabled) return

    const cards = Array.from(root.querySelectorAll<HTMLElement>('.motion-card'))
    const icons = Array.from(root.querySelectorAll<HTMLElement>('.motion-icon'))
    const shines = Array.from(root.querySelectorAll<HTMLElement>('.motion-shine'))
    if (!cards.length) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      cards.concat(icons).forEach(element => {
        element.style.opacity = '1'
        element.style.transform = 'none'
      })
      return
    }

    cards.concat(icons).forEach(element => {
      element.style.opacity = '0'
      element.style.willChange = 'transform, opacity'
    })

    let played = false
    const stopReveal = inView(
      root,
      () => {
        if (played) return
        played = true

        const controls = animate(
          [
            [
              cards,
              { opacity: [0, 1], x: [-40, 0], skewX: [5, 0] },
              { duration: 0.7, delay: stagger(0.15), ease: [0.22, 1, 0.36, 1] }
            ],
            [
              icons,
              { opacity: [0, 1], scale: [0.8, 1], rotate: [-15, 0] },
              {
                duration: 0.5,
                at: 0.22,
                delay: stagger(0.1),
                ease: [0.34, 1.56, 0.64, 1]
              }
            ]
          ],
          { defaultTransition: { type: 'tween' } }
        )

        controls.then(() => {
          cards.concat(icons).forEach(element => {
            element.style.willChange = 'auto'
          })
        })

        return () => controls.stop()
      },
      { margin: '0px 0px -15% 0px', amount: 0.14 }
    )

    const shineControls = shines.map((shine, index) =>
      animate(
        shine,
        { opacity: [0, 0.15, 0], x: ['-100%', '200%'] },
        {
          duration: 2.5,
          delay: 5 + index * 0.4,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 5
        }
      )
    )

    return () => {
      stopReveal()
      shineControls.forEach(control => control.stop())
    }
  }, [options.enabled])

  return containerRef
}
