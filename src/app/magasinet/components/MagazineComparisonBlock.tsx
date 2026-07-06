import type { MagazineBlock } from '../types'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineComparisonBlockProps = {
  block: Extract<MagazineBlock, { type: 'comparison' }>
}

export function MagazineComparisonBlock({
  block
}: MagazineComparisonBlockProps) {
  return (
    <article className='my-16'>
      <h2 className='font-sans text-4xl leading-[0.95] font-bold text-balance text-background dark:text-dark-background sm:text-5xl'>
        <MagazineInlineTitle text={block.title} />
      </h2>
      <div className='mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {block.columns.map(column => (
          <article
            key={column.title}
            className='rounded-lg border border-background/10 dark:border-dark-background/10 bg-cloud-dancer p-5'
          >
            <h3 className='font-sans text-2xl leading-[0.95] font-bold text-background dark:text-dark-background'>
              <MagazineInlineTitle text={column.title} />
            </h3>
            {column.text && (
              <p className='mt-3 text-base leading-[1.55] text-background/74 dark:text-dark-background/74'>
                {column.text}
              </p>
            )}
            <ul className='mt-5 space-y-3'>
              {column.items.map(item => (
                <li
                  key={item}
                  className='leading-text-paragraph flex gap-3 text-sm text-background/80 dark:text-dark-background/80'
                >
                  <span className='mt-1 size-2 shrink-0 rounded-full bg-(--magazine-accent)' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </article>
  )
}
