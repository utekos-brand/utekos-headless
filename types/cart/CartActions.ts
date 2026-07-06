import { ClearCartLineSchema } from '@/db/zod/schemas/ClearCartLineSchema'
import { RemoveCartLineSchema } from '@/db/zod/schemas/RemoveCartLineSchema'
import { UpdateCartSchema } from '@/db/zod/schemas/UpdateCartSchema'
import { z } from 'zod'
import type { Cart } from './Cart'

export type AddLinesInput =
  | { variantId: string; quantity: number }[]
  | {
      lines: { variantId: string; quantity: number }[]
      discountCode?: string
    }

export interface CartActions {
  addCartLine: (
    lines: { variantId: string; quantity: number }[],
    discountCode?: string
  ) => Promise<CartActionsResult>
  updateCartLineQuantity: (input: {
    lineId: string
    quantity: number
  }) => Promise<CartActionsResult>
  removeCartLine: (input: { lineId: string }) => Promise<CartActionsResult>
  clearCart: () => Promise<CartActionsResult>
}

export type CartActionsResult = {
  success: boolean
  message: string
  cart?: Cart | null
  error?: string | null
}

export type ClearCartLineInput = z.infer<typeof ClearCartLineSchema>

export type LastOperation = {
  type: 'add' | 'update' | 'remove' | 'clear'
  at: number
  payload?: unknown
}

export type OptimisticCartLines = { lines: Record<string, number> }

export type UpdateCartLineInput = z.infer<typeof UpdateCartSchema>

export type UpdateCartLineQuantityInput = z.infer<typeof UpdateCartSchema>
export type RemoveCartLineInput = z.infer<typeof RemoveCartLineSchema>
