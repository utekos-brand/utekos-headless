// Path: src/hooks/useCartLine.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { useCartId } from '@/hooks/useCartId'
import { fetchCart } from '@/lib/helpers/cart/fetchCart'
import type { Cart, CartLine } from 'types/cart'

export const useCartLine = (lineId: string): CartLine | undefined => {
  const cartId = useCartId()
  const selectLineById = (cart: Cart | null): CartLine | undefined =>
    cart?.lines?.find(line => line.id === lineId)

  const { data: line } = useQuery({
    queryKey: ['cart', cartId],
    queryFn: async () => {
      if (!cartId) return null
      return fetchCart(cartId)
    },
    enabled: !!cartId,
    select: selectLineById
  })

  return line
}
