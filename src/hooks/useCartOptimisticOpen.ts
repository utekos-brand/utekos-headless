import { cartStore } from '@/lib/state/cartStore'

export function useOptimisticCartOpen() {
  const openCartImmediately = () => {
    cartStore.send({ type: 'OPEN' })
  }

  return { openCartImmediately }
}