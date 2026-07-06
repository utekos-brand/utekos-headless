import { useEffect } from 'react'
import { CartMutationContext } from '@/lib/context/CartMutationContext'

export function useCartErrorMonitoring() {
  const lastError = CartMutationContext.useSelector(
    state => state.context.error
  )

  useEffect(() => {
    if (lastError) {
      console.error('Feil fra handlekurv-maskin:', lastError)
    }
  }, [lastError])
}
