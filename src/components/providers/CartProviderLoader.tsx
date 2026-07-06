import { getCartIdFromCookie } from '@/lib/actions/getCartIdFromCookie'
import Providers from '@/components/providers/Providers'
import { QueryClient, dehydrate } from '@tanstack/react-query'

export async function CartProviderLoader({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  const cartId = await getCartIdFromCookie()

  return (
    <Providers dehydratedState={dehydrate(queryClient)} cartId={cartId}>
      {children}
    </Providers>
  )
}
