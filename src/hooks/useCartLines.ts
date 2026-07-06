// Path: src/hooks/useCartLines.ts
import { useQuery } from '@tanstack/react-query'
import { useCartId } from '@/hooks/useCartId'
import { fetchCart } from '@/lib/helpers/cart/fetchCart'
import type { Cart } from 'types/cart'

const selectLineIds = (cart: Cart | null) =>
  cart?.lines?.map(line => line.id) ?? []
export const useCartLineIds = () => {
  const cartId = useCartId()

  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: async () => {
      if (!cartId) return null
      return fetchCart(cartId)
    },
    enabled: !!cartId,
    select: selectLineIds
  })
}
