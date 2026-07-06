import { useContext } from 'react'
import { CartIdContext } from '@/lib/context/CartIdContext'
export const useCartId = () => {
  const cartId = useContext(CartIdContext)
  return cartId
}
