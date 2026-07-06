// Path: src/lib/utils/selectLineIds.ts

import type { Cart } from 'types/cart'
export const selectLineIds = (cart: Cart | null) =>
  cart?.lines?.map(line => line.id) ?? []
