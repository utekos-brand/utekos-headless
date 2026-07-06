import { createSupabaseContext } from '@/lib/supabase/server'
import { Suspense } from 'react'

async function InstrumentsData() {
  const { data: ctx, error } = await createSupabaseContext({ auth: 'none' })
  if (error || !ctx) {
    return <pre>Error loading supabase context: {error?.message}</pre>
  }
  const { data: instruments } = await ctx.supabase.from('instruments').select()

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading instruments...</div>}>
      <InstrumentsData />
    </Suspense>
  )
}
