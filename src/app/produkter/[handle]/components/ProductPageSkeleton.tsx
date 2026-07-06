import { GalleryColumn } from '@/components/jsx/GalleryColumn'
import { OptionsColumn } from '@/components/jsx/OptionsColumn'
import { ProductPageGrid } from '@/components/jsx/ProductPageGrid'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductPageSkeleton() {
  return (
    <article className='bg-overcast relative isolate overflow-hidden py-10 md:py-14'>
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute top-12 left-[8%] h-80 w-80 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--ancient-water)_62%,transparent)_0%,transparent_72%)] blur-3xl' />
        <div className='absolute right-[8%] bottom-[18%] h-96 w-96 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--very-peri)_20%,transparent)_0%,transparent_72%)] blur-3xl' />
      </div>

      <div className='container mx-auto px-4 md:px-8'>
        <div className='mb-8 flex items-center gap-2'>
          <Skeleton className='bg-cloud-dancer/70 h-5 w-16' />
          <Skeleton className='bg-cloud-dancer/70 h-5 w-4' />
          <Skeleton className='bg-cloud-dancer/70 h-5 w-24' />
          <Skeleton className='bg-cloud-dancer/70 h-5 w-4' />
          <Skeleton className='bg-cloud-dancer/70 h-5 w-32' />
        </div>

        <ProductPageGrid>
          <GalleryColumn>
            <div className='mx-auto h-fit w-full max-w-lg md:sticky md:top-8'>
              <Skeleton className='bg-cloud-dancer/70 aspect-2/3 w-full rounded-3xl' />
            </div>
          </GalleryColumn>

          <OptionsColumn>
            <div className='hidden md:block'>
              <Skeleton className='bg-cloud-dancer/70 h-10 w-full' />
              <Skeleton className='bg-cloud-dancer/70 mt-3 h-6 w-2/3' />
            </div>
            <Skeleton className='bg-cloud-dancer/70 mt-6 hidden h-8 w-28 md:block' />

            <div className='border-cloud-dancer/70 bg-cloud-dancer/72 rounded-3xl border p-6 md:mt-6'>
              <div className='mt-10 space-y-8'>
                <div className='space-y-2'>
                  <Skeleton className='bg-overcast/80 h-4 w-20' />
                  <Skeleton className='bg-overcast/80 h-10 w-full' />
                </div>
                <div className='space-y-2'>
                  <Skeleton className='bg-overcast/80 h-4 w-20' />
                  <Skeleton className='bg-overcast/80 h-10 w-full' />
                </div>
              </div>
              <Skeleton className='bg-overcast/80 mt-8 h-12 w-full' />
              <div className='mt-12 space-y-3'>
                <Skeleton className='bg-overcast/80 h-4 w-full' />
                <Skeleton className='bg-overcast/80 h-4 w-full' />
                <Skeleton className='bg-overcast/80 h-4 w-5/6' />
              </div>
            </div>
          </OptionsColumn>
        </ProductPageGrid>
      </div>
    </article>
  )
}
