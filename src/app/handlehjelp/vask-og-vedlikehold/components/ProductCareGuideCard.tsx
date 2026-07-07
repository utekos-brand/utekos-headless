import { ProductCareCheckIcon } from './ProductCareCheckIcon'

interface ProductCareGuideCardProps {
  eyebrow: string
  title: string
  items: readonly string[]
}

export function ProductCareGuideCard({
  eyebrow,
  title,
  items
}: ProductCareGuideCardProps) {
  return (
    <article className='border-card-foreground/12 flex h-full w-full min-w-0 flex-col rounded-xl border border-card-foreground/12 bg-card p-5 text-sm/6 text-card-foreground ring-1 ring-card-foreground/12 sm:p-6 lg:p-7'>
      <p className='text-left font-sans text-xs font-medium text-card-foreground'>
        {eyebrow}
      </p>
      <h3 className='mt-1 text-left font-sans text-lg font-semibold text-card-foreground sm:text-xl xl:text-lg'>
        {title}
      </h3>
      <ul
        role='list'
        className='font-utekos-text mt-5 space-y-2.5 text-left text-card-foreground'
      >
        {items.map(item => (
          <li key={item} className='flex min-w-0'>
            <ProductCareCheckIcon />
            <p className='font-utekos-text ml-2.5 min-w-0 text-left text-base/6'>
              {item}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}
