import type { Variants } from 'motion/react'

export const skreddersyEase = [0.22, 1, 0.36, 1] as const
export const skreddersySpringEase = [0.34, 1.56, 0.64, 1] as const

export const skreddersyViewport = {
  once: true,
  amount: 0.16,
  margin: '0px 0px -8% 0px'
} as const

export const revealGroup = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
} satisfies Variants

export const revealItem = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: skreddersyEase
    }
  }
} satisfies Variants

export const revealItemLeft = {
  hidden: {
    opacity: 0,
    x: -28
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.68,
      ease: skreddersyEase
    }
  }
} satisfies Variants

export const revealItemRight = {
  hidden: {
    opacity: 0,
    x: 42
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.78,
      ease: skreddersyEase
    }
  }
} satisfies Variants

export const revealScale = {
  hidden: {
    opacity: 0,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: skreddersyEase
    }
  }
} satisfies Variants

export const revealPop = {
  hidden: {
    opacity: 0,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.56,
      ease: skreddersySpringEase
    }
  }
} satisfies Variants

export const scaleXReveal = {
  hidden: {
    scaleX: 0
  },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.78,
      ease: skreddersyEase
    }
  }
} satisfies Variants

export const scaleYReveal = {
  hidden: {
    scaleY: 0
  },
  visible: {
    scaleY: 1,
    transition: {
      duration: 0.72,
      ease: skreddersyEase
    }
  }
} satisfies Variants
