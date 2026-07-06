// components/skeletons/PricingSkeleton.tsx
export const PricingSkeleton = () => (
  <div className='flex flex-col items-center gap-2'>
    <div className='h-10 w-32 bg-stone-200/50 animate-pulse rounded-md' />
    <div className='h-4 w-48 bg-stone-100 animate-pulse rounded-md' />
  </div>
)
