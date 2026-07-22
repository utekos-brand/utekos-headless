export function ComfyrobeLandingSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Laster Comfyrobe'
      className='bg-background text-foreground'
    >
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16'>
        <div className='grid gap-7 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-7'>
          <div className='lg:col-start-2 lg:row-start-1'>
            <div className='h-10 w-44 rounded-full bg-foreground/10' />
            <div className='mt-5 h-12 w-full max-w-xl rounded-xl bg-foreground/10 sm:h-28' />
            <div className='mt-5 h-20 w-full max-w-xl rounded-xl bg-foreground/10' />
          </div>
          <div className='aspect-4/5 rounded-3xl border border-foreground/20 bg-foreground/10 lg:col-start-1 lg:row-start-1 lg:row-span-2' />
          <div className='min-h-128 rounded-3xl border border-foreground/20 bg-foreground/[0.06] p-6 lg:col-start-2 lg:row-start-2'>
            <div className='h-14 w-48 rounded-xl bg-foreground/10' />
            <div className='mt-8 h-12 w-full rounded-xl bg-foreground/10' />
            <div className='mt-4 h-28 w-full rounded-xl bg-foreground/10' />
            <div className='mt-7 h-14 w-full rounded-full bg-foreground/10' />
          </div>
        </div>
      </div>
    </main>
  )
}
