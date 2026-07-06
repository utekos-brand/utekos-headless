import { createSupabaseContext } from '@/lib/supabase/server'

export default async function Notes() {
  const { data: ctx, error } = await createSupabaseContext({ auth: 'none' })
  if (error || !ctx) {
    return <pre>Error loading supabase context: {error?.message}</pre>
  }
  const { data: notes } = await ctx.supabase.from('notes').select()

  return <pre>{JSON.stringify(notes, null, 2)}</pre>
}
