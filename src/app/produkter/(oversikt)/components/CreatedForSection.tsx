'use client'

import { useEffect, useRef } from 'react'
import { Heart } from 'lucide-react'
import { animate, inView, stagger } from 'motion'

export function CreatedForSection() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = container.current
    if (!root) return

    const q = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const iconWrapper = q('.motion-icon-wrapper')
    const iconGlow = q('.motion-icon-glow')
    const blobs = q('.motion-blob-1, .motion-blob-2')
    const revealTargets = q('.motion-icon-wrapper, .motion-title-line, .motion-divider, .motion-text')

    if (reduced) return

    revealTargets.forEach(target => {
      target.style.willChange = 'transform, opacity'
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
              iconWrapper,
              { opacity: [0, 1], scale: [0, 1], rotate: [-90, 0] },
              { duration: 1, ease: [0.34, 1.56, 0.64, 1] }
            ],
            [
              q('.motion-title-line'),
              { y: ['100%', '0%'], skewY: [5, 0] },
              { duration: 0.9, at: 0.18, delay: stagger(0.15), ease: [0.16, 1, 0.3, 1] }
            ],
            [
              q('.motion-divider'),
              { opacity: [0, 1], scaleX: [0, 1] },
              { duration: 0.85, at: 0.42, ease: [0.34, 1.56, 0.64, 1] }
            ],
            [
              q('.motion-text'),
              { opacity: [0, 1], y: [30, 0] },
              { duration: 0.75, at: 0.55, ease: [0.22, 1, 0.36, 1] }
            ],
            [
              q('.motion-desc-underline, .motion-desc-highlight'),
              { scaleX: [0, 1] },
              { duration: 0.65, at: 0.72, delay: stagger(0.08), ease: [0.16, 1, 0.3, 1] }
            ]
          ],
          { defaultTransition: { type: 'tween' } }
        )

        controls.then(() => {
          revealTargets.forEach(target => {
            target.style.willChange = 'auto'
          })
        })

        return () => controls.stop()
      },
      { margin: '0px 0px -18% 0px', amount: 0.16 }
    )

    const loopControls = [
      ...iconWrapper.map(element =>
        animate(element, { y: [0, -10, 0] }, { duration: 2, delay: 1.2, ease: 'easeInOut', repeat: Infinity })
      ),
      ...iconGlow.map(element =>
        animate(
          element,
          { boxShadow: ['0 0 15px rgba(255,255,255,0.05)', '0 0 25px rgba(255,255,255,0.15)', '0 0 15px rgba(255,255,255,0.05)'] },
          { duration: 2, ease: 'easeInOut', repeat: Infinity }
        )
      ),
      ...blobs.map((element, index) =>
        animate(
          element,
          {
            x: index === 0 ? ['0%', '20%', '0%'] : ['0%', '-20%', '0%'],
            y: index === 0 ? ['0%', '-20%', '0%'] : ['0%', '20%', '0%'],
            scale: index === 0 ? [1, 1.1, 1] : [1, 0.9, 1],
            rotate: index === 0 ? [0, 10, 0] : [0, -10, 0]
          },
          { duration: index === 0 ? 8 : 10, delay: index === 0 ? 0 : 1, ease: 'easeInOut', repeat: Infinity }
        )
      )
    ]

    return () => {
      stopReveal()
      loopControls.forEach(control => control.stop())
    }
  }, [])

  return (
    <div
      ref={container}
      className='relative mb-12 w-full rounded-3xl mt-6 overflow-hidden border-y border-white/5 bg-muted py-8 text-center md:mb-20 md:py-32'
    >
      <div className='absolute inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]' />

        <div className='motion-blob-1 absolute left-[30%] top-[20%] size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ceramic blur-[120px] mix-blend-screen' />
        <div className='motion-blob-2 absolute right-[30%] bottom-[20%] h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-white/5 blur-[100px] mix-blend-screen' />
      </div>

      <div className='relative z-10 container mx-auto px-4 flex flex-col items-center'>
        <div className='motion-icon-wrapper mb-10 will-change-transform'>
          <div className='motion-icon-glow flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-ceramic/80 shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-sm'>
            <Heart className='size-7 text-ceramic fill-ceramic' />
          </div>
        </div>

        <h2 className='text-balance text-4xl font-bold   sm:text-5xl md:text-7xl leading-tight'>
          <span className='block overflow-hidden'>
            <span className='motion-title-line text-card block will-change-transform'>Skapt for</span>
          </span>
          <span className='block overflow-hidden pb-2'>
            <span className='motion-title-line block will-change-transform'>
              <span className='text-transparent bg-clip-text bg-linear-to-r from-slate-900 via-slate-400 to-slate-900 bg-[length:200%_auto] animate-shine py-1'>
                din Utekos
              </span>
            </span>
          </span>
        </h2>

        <div className='motion-divider h-[2px] w-32 bg-linear-to-r from-transparent via-slate-500/30 to-transparent my-10 origin-center will-change-transform' />

        <p className='motion-text opacity-0 mx-auto max-w-2xl text-lg leading-relaxed text-background/90 md:text-xl font-light'>
          Våre komfortplagg er{' '}
          <span className='relative inline-block text-background font-medium'>
            designet
            <span className='motion-desc-underline absolute left-0 bottom-0 h-[2px] w-full bg-slate-500 origin-left scale-x-0' />
          </span>{' '}
          for å holde deg varm, slik at du kan{' '}
          <span className='relative inline-block px-1'>
            <span className='motion-desc-highlight absolute inset-0 -skew-x-6 text-background/90 rounded bg-white/10 origin-left scale-x-0' />
            <span className='relative z-10 font-medium text-background/90'>nyte</span>
          </span>{' '}
          de gode øyeblikkene lenger.
        </p>
      </div>
    </div>
  )
}
