// Path: src/hooks/useInView.ts
import { useEffect, useRef, useState, useCallback } from 'react'

interface UseInViewOptions {
  threshold?: number
  triggerOnce?: boolean
  rootMargin?: string
}
export function useInView<T extends Element>({
  threshold = 0.3,
  triggerOnce = true,
  rootMargin = '0px'
}: UseInViewOptions = {}): [(node: T | null) => void, boolean] {
  const [ref, setRef] = useState<T | null>(null)
  const [isInView, setIsInView] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const onIntersect = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      if (entry && entry.isIntersecting) {
        setIsInView(true)
        if (triggerOnce && observerRef.current) {
          observerRef.current.unobserve(entry.target)
        }
      }
    },
    [triggerOnce]
  )

  useEffect(() => {
    if (!ref) return

    observerRef.current = new IntersectionObserver(onIntersect, {
      rootMargin,
      threshold
    })

    observerRef.current.observe(ref)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [ref, rootMargin, threshold, onIntersect])

  return [setRef, isInView]
}
