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
            <h2 className='dark:text-dark-background font-sans text-4xl leading-[0.95] font-bold text-balance text-background sm:text-5xl'>
              <MagazineInlineTitle text={block.title} />
            </h2>
          )}

          {block.intro && (
            <p className='dark:text-dark-background/76 mx-auto mt-4 max-w-2xl text-lg leading-[1.55] text-background/76'>
              {block.intro}
            </p>
          )}
        </header>
      )}

      <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
        {block.items.map(item => (
          <li
            key={item.title}
            className='dark:border-dark-background/10 rounded-lg border border-background/10 bg-foreground p-5 shadow-[0_22px_62px_-54px_color-mix(in_oklch,var(--background)_70%,transparent)]'
          >
            <div className='dark:border-dark-background/10 dark:text-dark-background mb-4 flex size-11 items-center justify-center rounded-lg border border-background/10 bg-(--magazine-accent) text-background'>
              <MagazineIcon
                name={item.icon ?? 'check'}
                className='size-5'
              />
            </div>

            <h3 className='dark:text-dark-background font-sans text-2xl leading-[0.95] font-bold text-background'>
              <MagazineInlineTitle text={item.title} />
            </h3>

            <p className='dark:text-dark-background/76 mt-3 text-base leading-[1.55] text-background/76'>
              {item.text}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}
