import { applyDiscount } from '@/api/lib/cart/applyDiscount'
import type { QueryClient } from '@tanstack/react-query'

interface CampaignContext {
  cartId: string | null
  additionalLine?: { variantId: string; quantity: number } | undefined
  queryClient: QueryClient
}

export async function handlePostAddToCartCampaigns({
  cartId,
  additionalLine,
  queryClient
}: CampaignContext): Promise<void> {
  if (additionalLine && cartId) {
    try {
      const updatedCart = await applyDiscount(cartId, 'GRATISBUFF')
      if (updatedCart) {
        queryClient.setQueryData(['cart', cartId], updatedCart)
      }
    } catch (e) {
      console.error('Feil ved påføring av kampanjerabatt:', e)
    }
  }
}
