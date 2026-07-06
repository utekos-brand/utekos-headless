// Path: src/hooks/useCartQuery.tsx
import { useQuery } from '@tanstack/react-query'
import { useCartId } from '@/hooks/useCartId'
import { fetchCart } from '@/lib/helpers/cart/fetchCart'
import type { Cart } from 'types/cart'
export const useCartQuery = () => {
  const cartId = useCartId()

  return useQuery<Cart | null>({
    queryKey: ['cart', cartId] as const,
    queryFn: async () => {
      if (!cartId) return null
      return fetchCart(cartId)
    },
    enabled: !!cartId,
    staleTime: 1000 * 60, // 1 minute stale time
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    refetchOnWindowFocus: false, // Disable auto-refetch on focus
    refetchOnMount: false // Don't refetch on mount if data exists
  })
}
