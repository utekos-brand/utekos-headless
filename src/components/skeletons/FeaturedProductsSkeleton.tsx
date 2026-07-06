import { PageSection } from '@/components/layout/PageSection'
import { Skeleton } from '@/components/ui/skeleton'

export function FeaturedProductsSkeleton() {
  return (
    <PageSection as='div' background='default'>
      <Skeleton className='h-10 w-64 mx-auto mb-12' />
      <Skeleton className='h-[400px] w-full' />
    </PageSection>
  )
}
