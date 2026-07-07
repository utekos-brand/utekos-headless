import type { MagazineBlock } from '../types'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineFaqBlockProps = {
  block: Extract<MagazineBlock, { type: 'faq' }>
}

export function MagazineFaqBlock({
  block
}: MagazineFaqBlockProps) {
  return (
    <article className='my-16'>
      {block.title && (
        <h2 className='text-background font-sans text-4xl leading-[0.95] font-bold text-balance text-background sm:text-5xl'>
          <MagazineInlineTitle text={block.title} />
        </h2>
      )}
      <dl className='mt-8 space-y-4'>
        {block.items.map(item => (
          <div
            key={item.question}
            className='border-background/10 rounded-lg border border-background/10 bg-foreground p-5'
          >
            <dt className='text-background font-sans text-xl leading-[1.05] font-bold text-background'>
              {item.question}
            </dt>
            <dd className='text-background/76 mt-3 text-base leading-[1.55] text-background/76'>
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
