import { useEffect, useRef } from 'react'
import { animate, inView, stagger } from 'motion'

export function useSocialProofAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const chars = Array.from(root.querySelectorAll<HTMLElement>('.motion-heading-char'))
    const highlights = Array.from(root.querySelectorAll<HTMLElement>('.motion-highlight-bg'))
    const underlines = Array.from(root.querySelectorAll<HTMLElement>('.motion-underline'))
    const text = textRef.current

    let played = false
    const stopInView = inView(
      root,
      () => {
        if (played) return
        played = true

        const controls = animate(
          [
            [
              chars,
              { opacity: [0, 1], y: ['100%', '0%'], rotateX: [-90, 0], filter: ['blur(10px)', 'blur(0px)'] },
              { duration: 1.05, delay: stagger(0.04), ease: [0.16, 1, 0.3, 1] }
            ],
            [
              text ? [text] : [],
              { opacity: [0, 1], y: [20, 0], filter: ['blur(5px)', 'blur(0px)'] },
              { duration: 0.82, at: 0.42, ease: [0.22, 1, 0.36, 1] }
            ],
            [
              highlights,
              { opacity: [0, 1], scaleX: [0, 1] },
              { duration: 0.72, at: 0.58, ease: [0.22, 1, 0.36, 1] }
            ],
            [
              underlines,
              { scaleX: [0, 1] },
              { duration: 0.8, at: 0.68, ease: [0.16, 1, 0.3, 1] }
            ]
          ],
          { defaultTransition: { type: 'tween' } }
        )

        return () => controls.stop()
      },
      { margin: '0px 0px -20% 0px', amount: 0.14 }
    )

    return () => stopInView()
  }, [])

  return { containerRef, titleRef, textRef }
}
