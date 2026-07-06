import { animate, inView, stagger } from 'motion'

export async function mountTechTeaser(root: HTMLElement): Promise<() => void> {
  const content = Array.from(root.querySelectorAll<HTMLElement>('.motion-content'))
  const cardVisual = root.querySelector<HTMLElement>('.motion-card-visual')

  content.forEach(element => {
    element.style.opacity = '0'
    element.style.willChange = 'transform, opacity'
  })

  if (cardVisual) {
    cardVisual.style.opacity = '0'
    cardVisual.style.willChange = 'transform, opacity'
  }

  let revealPlayed = false
  const stopReveal = inView(
    root,
    () => {
      if (revealPlayed) return
      revealPlayed = true

      const controls = animate(
        [
          [
            content,
            { opacity: [0, 1], y: [30, 0] },
            { duration: 0.75, delay: stagger(0.1), ease: [0.22, 1, 0.36, 1] }
          ],
          [
            cardVisual ? [cardVisual] : [],
            { opacity: [0, 1], x: [30, 0], rotateY: [10, 0] },
            { duration: 0.9, at: 0.22, ease: [0.22, 1, 0.36, 1] }
          ]
        ],
        { defaultTransition: { type: 'tween' } }
      )

      controls.then(() => {
        content.concat(cardVisual ? [cardVisual] : []).forEach(element => {
          element.style.willChange = 'auto'
        })
      })

      return () => controls.stop()
    },
    { margin: '0px 0px -20% 0px', amount: 0.16 }
  )

  const canHover = window.matchMedia('(hover: hover)').matches
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (!canHover || !finePointer) {
    return stopReveal
  }

  const card = root.querySelector<HTMLElement>('[data-tech-card]')
  const tiltLayer = root.querySelector<HTMLElement>('[data-tilt-layer]')
  const inner = root.querySelector<HTMLElement>('[data-inner-parallax]')

  if (!card || !tiltLayer || !inner) {
    return stopReveal
  }

  tiltLayer.style.transition = 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)'
  inner.style.transition = 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)'

  let rect: DOMRect | null = null

  const onEnter = () => {
    rect = card.getBoundingClientRect()
  }

  const onMove = (event: MouseEvent) => {
    if (!rect) rect = card.getBoundingClientRect()

    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    tiltLayer.style.transform = `rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`
    inner.style.transform = `translate3d(${x * 20}px, ${y * 20}px, 0)`
  }

  const onLeave = () => {
    tiltLayer.style.transform = 'rotateX(0deg) rotateY(0deg)'
    inner.style.transform = 'translate3d(0, 0, 0)'
    rect = null
  }

  const onResize = () => {
    rect = null
  }

  card.addEventListener('mouseenter', onEnter, { passive: true })
  card.addEventListener('mousemove', onMove, { passive: true })
  card.addEventListener('mouseleave', onLeave, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  return () => {
    window.removeEventListener('resize', onResize)
    card.removeEventListener('mouseenter', onEnter)
    card.removeEventListener('mousemove', onMove)
    card.removeEventListener('mouseleave', onLeave)
    stopReveal()
  }
}
