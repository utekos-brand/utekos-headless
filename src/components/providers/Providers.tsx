'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { HydrationBoundary } from '@tanstack/react-query'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { makeQueryClient } from '@/api/lib/makeQueryClient'
import { CartMutationProvider } from '@/clients/CartMutationProvider'
import { serverActions } from '@/constants/serverActions'
import { CartIdProvider } from '@/components/providers/CartIdProvider'
import type { DehydratedState } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development' ?
    dynamic(
      () =>
        import('@tanstack/react-query-devtools').then(
          module => module.ReactQueryDevtools
        ),
      { ssr: false }
    )
  : null

interface ProvidersProps {
  children: React.ReactNode
  cartId: string | null
  dehydratedState: DehydratedState
}

export default function Providers({
  children,
  cartId: initialCartId,
  dehydratedState
}: ProvidersProps) {
  const [queryClient] = useState(makeQueryClient)
  const [cartId, setCartId] = useState<string | null>(
    initialCartId
  )

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='dark'
      forcedTheme='dark'
      disableTransitionOnChange
      enableColorScheme
    >
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <CartIdProvider value={cartId}>
            <CartMutationProvider
              actions={serverActions}
              cartId={cartId}
              setCartId={setCartId}
            >
              {children}
            </CartMutationProvider>
          </CartIdProvider>
        </HydrationBoundary>
        {ReactQueryDevtools ?
          <ReactQueryDevtools initialIsOpen={false} />
        : null}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
