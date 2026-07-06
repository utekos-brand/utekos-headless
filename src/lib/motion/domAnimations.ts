import { animate, inView, stagger } from 'motion'

type MotionControls = ReturnType<typeof animate>
type InViewOptions = NonNullable<Parameters<typeof inView>[2]>

type RevealOptions = Parameters<typeof animate>[2] & {
  margin?: InViewOptions['margin']
  amount?: InViewOptions['amount']
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window === 'undefined'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function scopedElements(root: ParentNode, selector: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector))
}

export function stopAnimations(controls: Array<MotionControls | null | undefined>) {
  controls.forEach(control => control?.stop())
}

export function revealOnEnter(
  trigger: Element,
  targets: Element | Element[],
  keyframes: Parameters<typeof animate>[1],
  { margin = '0px 0px -18% 0px', amount = 0.12, ...options }: RevealOptions = {}
) {
  if (prefersReducedMotion()) {
    const targetList = Array.isArray(targets) ? targets : [targets]
    targetList.forEach(target => {
      if (target instanceof HTMLElement) {
        target.style.opacity = '1'
        target.style.transform = 'none'
        target.style.filter = 'none'
        target.style.willChange = 'auto'
      }
    })
    return () => {}
  }

  return inView(
    trigger,
    () => {
      const controls = animate(targets, keyframes, options)
      return () => controls.stop()
    },
    { margin, amount }
  )
}

export { animate, stagger }
