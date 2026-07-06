import { Skeleton } from '@/components/ui/skeleton'

export function QuickViewModalSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
      <Skeleton className='aspect-[3/4] w-full rounded-2xl' />
      <div className='flex flex-col gap-6'>
        <Skeleton className='h-12 w-3/4' />
        <Skeleton className='h-8 w-32' />
        <div className='space-y-4 pt-4'>
          <Skeleton className='h-5 w-24' />
          <div className='flex gap-3'>
            <Skeleton className='h-12 w-28' />
            <Skeleton className='h-12 w-28' />
            <Skeleton className='h-12 w-28' />
          </div>
        </div>
        <Skeleton className='h-32 w-full rounded-xl' />
        <Skeleton className='mt-auto h-14 w-full rounded-full' />
      </div>
    </div>
  )
}
