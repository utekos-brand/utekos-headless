import { Skeleton } from '@/components/ui/skeleton'

type RouteLoadingStateProps = {
  kind?: 'default' | 'product'
}

export function RouteLoadingState({
  kind = 'default'
}: RouteLoadingStateProps) {
  const isProduct = kind === 'product'

  return (
    <section
      aria-busy='true'
      aria-live='polite'
      role='status'
      className='min-h-[60vh] bg-background px-4 py-10 text-foreground sm:px-6 lg:px-10'
    >
      <span className='sr-only'>Laster siden</span>
      <div className='mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start'>
        <div className='space-y-6'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-12 w-full max-w-2xl' />
          <Skeleton className='h-5 w-full max-w-xl' />
          <Skeleton className='h-5 w-4/5 max-w-lg' />
          <div className='grid gap-4 sm:grid-cols-2'>
            <Skeleton className='h-32 w-full' />
            <Skeleton className='h-32 w-full' />
          </div>
        </div>
        <Skeleton
          className={
            isProduct ?
              'aspect-2/3 w-full rounded-3xl'
            : 'aspect-4/3 w-full rounded-3xl'
          }
        />
      </div>
    </section>
  )
}
