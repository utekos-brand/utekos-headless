import { cartStore } from '@/lib/state/cartStore'
import { useSelector } from '@xstate/store/react'

import type { CartUserInterfaceContext } from 'types/cart'
import type { StoreSnapshot } from '@xstate/store'

export const selectIsOpen = (
  snapshot: StoreSnapshot<CartUserInterfaceContext>
): boolean => snapshot.context.open
export const useCartOpen = () => useSelector(cartStore, selectIsOpen)
