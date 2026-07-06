'use client'

import { HydrationBoundary, QueryClientProvider, type DehydratedState } from '@tanstack/react-query'
import { useState } from 'react'
import { makeQueryClient } from '@/api/lib/makeQueryClient'

export default function Hydrate({ state, children }: { state: DehydratedState; children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </QueryClientProvider>
  )
}
