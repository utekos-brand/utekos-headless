type Cleanup = () => void

export function runAfterPageSettles(callback: () => void): Cleanup {
  if (typeof window === 'undefined') {
    return () => {}
  }

  let cancelled = false
  let timeoutId: number | null = null
  let idleId: number | null = null

  const run = () => {
    timeoutId = window.setTimeout(() => {
      if (cancelled) return

      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(
          () => {
            if (!cancelled) callback()
          },
          { timeout: 5000 }
        )
        return
      }

      callback()
    }, 3000)
  }

  if (document.readyState === 'complete') {
    run()
  } else {
    window.addEventListener('load', run, { once: true })
  }

  return () => {
    cancelled = true
    window.removeEventListener('load', run)

    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
    }

    if (idleId !== null && 'cancelIdleCallback' in window) {
      window.cancelIdleCallback(idleId)
    }
  }
}
