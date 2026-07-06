import type { MagazineBlock } from '../types'
import { MagazineIcon } from './MagazineIcon'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineFeatureGridBlockProps = {
  block: Extract<MagazineBlock, { type: 'featureGrid' }>
}

export function MagazineFeatureGridBlock({
  block
}: MagazineFeatureGridBlockProps) {
  return (
    <article className='my-16'>
      {(block.title || block.intro) && (
        <header className='mx-auto mb-8 max-w-3xl text-center'>
          {block.title && (
            <h2 className='font-sans text-4xl leading-[0.95] font-bold text-balance text-background dark:text-dark-background sm:text-5xl'>
              <MagazineInlineTitle text={block.title} />
            </h2>
          )}

          {block.intro && (
            <p className='mx-auto mt-4 max-w-2xl text-lg leading-[1.55] text-background/76 dark:text-dark-background/76'>
              {block.intro}
            </p>
          )}
        </header>
      )}

      <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {block.items.map(item => (
          <li
            key={item.title}
            className='rounded-lg border border-background/10 dark:border-dark-background/10 bg-cloud-dancer p-5 shadow-[0_22px_62px_-54px_color-mix(in_oklch,var(--background)_70%,transparent)]'
          >
            <div className='mb-4 flex size-11 items-center justify-center rounded-lg border border-background/10 dark:border-dark-background/10 bg-(--magazine-accent) text-background dark:text-dark-background'>
              <MagazineIcon
                name={item.icon ?? 'check'}
                className='size-5'
              />
            </div>

            <h3 className='font-sans text-2xl leading-[0.95] font-bold text-background dark:text-dark-background'>
              <MagazineInlineTitle text={item.title} />
            </h3>

            <p className='mt-3 text-base leading-[1.55] text-background/76 dark:text-dark-background/76'>
              {item.text}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}
