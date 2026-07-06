/*eslint-disable react-hooks/exhaustive-deps*/

import { startTransition, useEffect } from 'react'

export function useCommandK(open: boolean, setOpen: (v: boolean) => void) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setTimeout(() => {
        startTransition(() => setOpen(!open))
      }, 0)
    }
    if (e.key === 'Escape') {
      startTransition(() => setOpen(false))
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
