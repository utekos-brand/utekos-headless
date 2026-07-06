export function VideoSkeleton() {
  return (
    <div className='bg-[color-mix(in_oklab,var(--card)_85%,#050508)]'>
      <div className='mx-auto w-full max-w-7xl'>
        <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
          <div className='aspect-9/16 w-full max-w-sm mx-auto animate-pulse rounded-3xl border-4 border-neutral-700 bg-neutral-800 p-2' />

          <div className='space-y-6'>
            <div className='h-10 w-3/4 rounded-lg bg-neutral-800' />
            <div className='space-y-3'>
              <div className='h-4 w-full rounded-lg bg-neutral-800' />
              <div className='h-4 w-full rounded-lg bg-neutral-800' />
              <div className='h-4 w-5/6 rounded-lg bg-neutral-800' />
            </div>
            <div className='h-12 w-48 rounded-lg bg-neutral-800' />
          </div>
        </div>
      </div>
    </div>
  )
}
