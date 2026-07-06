import { ProductCardSkeleton } from './ProductCardSkeleton'

export function ProductGridSkeleton() {
  return (
    <article className='container mx-auto py-12 sm:py-16 lg:py-16'>
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </article>
  )
}
