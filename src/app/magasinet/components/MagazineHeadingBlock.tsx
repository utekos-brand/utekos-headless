import type { MagazineBlock } from '../types'

type MagazineHeadingBlockProps = {
  block: Extract<MagazineBlock, { type: 'heading' }>
}

export function MagazineHeadingBlock({
  block
}: MagazineHeadingBlockProps) {
  if (block.level === 3) {
    return (
      <div className='pt-4'>
        {block.eyebrow && (
          <p className='text-magazine-article-card-pill mb-3 text-sm leading-4 font-semibold'>
            {block.eyebrow}
          </p>
        )}
        <h3 className='font-sans text-3xl leading-[0.95] font-bold text-balance text-foreground sm:text-4xl'>
          {block.text}
        </h3>
      </div>
    )
  }

  return (
    <div className='pt-6'>
      {block.eyebrow && (
        <p className='text-magazine-article-card-pill mb-3 text-sm leading-4 font-semibold'>
          {block.eyebrow}
        </p>
      )}
      <h2 className='font-sans text-4xl leading-[0.95] font-bold text-balance text-foreground sm:text-5xl'>
        {block.text}
      </h2>
    </div>
  )
}
