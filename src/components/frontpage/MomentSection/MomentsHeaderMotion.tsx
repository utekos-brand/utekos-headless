'use client'

import { useEffect } from 'react'
import { animate, inView, stagger } from 'motion'

const HEADER_ID = 'moments-header'

function setVisible(root: HTMLElement) {
  const words = root.querySelectorAll<HTMLElement>('[data-cinematic-word]')
  const paths = root.querySelectorAll<SVGPathElement>(
    '[data-organic-circle-path]'
  )

  words.forEach(word => {
    word.style.opacity = '1'
    word.style.transform = ''
    word.style.filter = ''
    word.style.willChange = ''
  })

  paths.forEach(path => {
    path.style.strokeDasharray = ''
    path.style.strokeDashoffset = ''
  })
}

export function MomentsHeaderMotion() {
  useEffect(() => {
    const root = document.getElementById(HEADER_ID)
    if (!root) {
      return
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) {
      setVisible(root)
      return
    }

    const words = Array.from(root.querySelectorAll<HTMLElement>('[data-cinematic-word]'))
    const paths = Array.from(root.querySelectorAll<SVGPathElement>('[data-organic-circle-path]'))

    words.forEach(word => {
      word.style.opacity = '0'
      word.style.filter = 'blur(10px)'
      word.style.transform = 'translateY(20px) scale(1.08)'
      word.style.willChange = 'transform, opacity, filter'
    })

    paths.forEach(path => {
      const length = path.getTotalLength()
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(length)
    })

    let played = false
    const stopInView = inView(
      root,
      () => {
        if (played) return
        played = true

        const wordControls = animate(
          words,
          { opacity: [0, 1], filter: ['blur(10px)', 'blur(0px)'], scale: [1.08, 1], y: [20, 0] },
          { duration: 0.95, delay: stagger(0.045), ease: [0.22, 1, 0.36, 1] }
        )

        const pathControls = paths.map(path => {
          const delayElement = path.closest('[data-motion-delay]')
          const delay =
            delayElement instanceof HTMLElement ?
              Number(delayElement.dataset.motionDelay ?? 0)
            : 0

          return animate(path, { strokeDashoffset: 0 }, { duration: 1.1, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] })
        })

        wordControls.then(() => {
          words.forEach(word => {
            word.style.willChange = 'auto'
          })
        })

        return () => {
          wordControls.stop()
          pathControls.forEach(control => control.stop())
        }
      },
      { margin: '240px 0px' }
    )

    return () => {
      stopInView()
    }
  }, [])

  return null
}
