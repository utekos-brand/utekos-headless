import type { CartActions } from 'types/cart/CartActions'
import { addCartLinesAction } from '@/lib/actions/addCartLinesAction'
import { clearCartAction } from '@/lib/actions/clearCartAction'
import { removeCartLineAction } from '@/lib/actions/removeCartLineAction'
import { updateCartLineQuantityAction } from '@/lib/actions/updateCartLineQuantityAction'

export const serverActions: CartActions = {
  addCartLine: addCartLinesAction,
  updateCartLineQuantity: updateCartLineQuantityAction,
  removeCartLine: removeCartLineAction,
  clearCart: clearCartAction
}
