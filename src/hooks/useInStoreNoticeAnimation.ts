import { useEffect, useRef } from 'react'
import { animate, inView, stagger } from 'motion'

const SMOKE_MOTION = [
  { scaleEnd: 3.2, x: -72, y: -36 },
  { scaleEnd: 4.1, x: -48, y: -18 },
  { scaleEnd: 3.6, x: -88, y: -42 },
  { scaleEnd: 4.4, x: -32, y: -24 },
  { scaleEnd: 3.8, x: -64, y: -12 }
] as const

const SPARK_MOTION = [
  { scalePeak: 0.8, x: 48, y: 22 },
  { scalePeak: 1, x: 72, y: 36 },
  { scalePeak: 0.6, x: 36, y: 18 },
  { scalePeak: 0.9, x: 84, y: 28 },
  { scalePeak: 0.7, x: 56, y: 44 },
  { scalePeak: 1, x: 92, y: 16 },
  { scalePeak: 0.85, x: 40, y: 32 },
  { scalePeak: 0.75, x: 68, y: 40 }
] as const

function commitVisibleState(
  logoBox: HTMLElement,
  content: HTMLElement,
  particles: HTMLElement[]
) {
  logoBox.style.opacity = '1'
  logoBox.style.transform = 'none'
  logoBox.style.willChange = 'auto'

  content.style.opacity = '1'
  content.style.transform = 'none'
  content.style.willChange = 'auto'

  particles.forEach(particle => {
    particle.style.opacity = '0'
    particle.style.transform = 'none'
    particle.style.willChange = 'auto'
  })
}

export function useInStoreNoticeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoBoxRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = containerRef.current
    const logoBox = logoBoxRef.current
    const content = contentRef.current
    if (!root || !logoBox || !content) return

    const smokeParticles = Array.from(
      root.querySelectorAll<HTMLElement>('.smoke-particle')
    )
    const sparkParticles = Array.from(
      root.querySelectorAll<HTMLElement>('.spark-particle')
    )
    const particles = smokeParticles.concat(sparkParticles)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commitVisibleState(logoBox, content, particles)
      return
    }

    logoBox.style.opacity = '0'
    logoBox.style.transform = 'translateX(-140%) rotate(-15deg) scaleX(1.2)'
    logoBox.style.willChange = 'transform, opacity'

    content.style.opacity = '0'
    content.style.transform = 'translateY(30px)'
    content.style.willChange = 'transform, opacity'

    particles.forEach(particle => {
      particle.style.opacity = '0'
      particle.style.transform = 'scale(0)'
      particle.style.willChange = 'transform, opacity'
    })

    let played = false
    let activeControls: ReturnType<typeof animate> | null = null

    const stopInView = inView(
      root,
      () => {
        if (played) {
          commitVisibleState(logoBox, content, particles)
          return
        }
        played = true

        activeControls = animate(
          [
            [
              logoBox,
              {
                opacity: [0, 1],
                x: ['-140%', '8%', '0%'],
                rotate: [-15, -25, 0],
                scaleX: [1.2, 0.9, 1]
              },
              {
                duration: 1.45,
                times: [0, 0.38, 1],
                ease: [0.22, 1, 0.36, 1]
              }
            ],
            [
              root,
              { x: [-4, 4, -3, 3, 0] },
              { duration: 0.28, at: 0.48, ease: 'easeInOut' }
            ],
            [
              smokeParticles,
              {
                opacity: [0, 0.65, 0],
                scale: SMOKE_MOTION.map(
                  motion => [0, motion.scaleEnd * 0.72, motion.scaleEnd] as const
                ),
                x: SMOKE_MOTION.map(motion => [0, motion.x] as const),
                y: SMOKE_MOTION.map(motion => [0, motion.y] as const)
              },
              {
                duration: 1.45,
                at: 0.42,
                delay: stagger(0.02),
                ease: [0.16, 1, 0.3, 1]
              }
            ],
            [
              sparkParticles,
              {
                opacity: [0, 1, 0],
                scale: SPARK_MOTION.map(
                  motion => [0, motion.scalePeak, 0] as const
                ),
                x: SPARK_MOTION.map(motion => [0, motion.x] as const),
                y: SPARK_MOTION.map(motion => [0, motion.y] as const)
              },
              {
                duration: 0.62,
                at: 0.45,
                delay: stagger(0.02),
                ease: [0.22, 1, 0.36, 1]
              }
            ],
            [
              content,
              { opacity: [0, 1], y: [30, 0] },
              { duration: 0.78, at: 0.66, ease: [0.22, 1, 0.36, 1] }
            ]
          ],
          { defaultTransition: { type: 'tween' } }
        )

        activeControls.then(() => {
          commitVisibleState(logoBox, content, particles)
          activeControls = null
        })

        return () => {
          activeControls?.stop()
          commitVisibleState(logoBox, content, particles)
          activeControls = null
        }
      },
      { margin: '0px 0px -18% 0px', amount: 0.2 }
    )

    return () => {
      activeControls?.stop()
      stopInView()
    }
  }, [])

  return { containerRef, logoBoxRef, contentRef }
}
