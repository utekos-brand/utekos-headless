import type { MagazineBlock } from '../types'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineStepListBlockProps = {
  block: Extract<MagazineBlock, { type: 'stepList' }>
}

export function MagazineStepListBlock({
  block
}: MagazineStepListBlockProps) {
  return (
    <article className='my-16'>
      {(block.title || block.intro) && (
        <header className='mb-8'>
          {block.title && (
            <h2 className='dark:text-dark-background font-sans text-4xl leading-[0.95] font-bold text-balance text-background sm:text-5xl'>
              <MagazineInlineTitle text={block.title} />
            </h2>
          )}
          {block.intro && (
            <p className='dark:text-dark-background/76 mt-4 max-w-2xl text-lg leading-[1.55] text-background/76'>
              {block.intro}
            </p>
          )}
        </header>
      )}
      <ol className='space-y-4'>
        {block.steps.map((step, index) => (
          <li
            key={step.title}
            className='dark:border-dark-background/10 bg-cloud-dancer grid gap-4 rounded-lg border border-background/10 p-5 sm:grid-cols-[3rem_1fr]'
          >
            <div className='dark:bg-dark-background flex size-11 items-center justify-center rounded-lg bg-background font-sans text-lg leading-none font-bold text-foreground'>
              {index + 1}
            </div>
            <div>
              <h3 className='dark:text-dark-background font-sans text-2xl leading-[0.95] font-bold text-background'>
                <MagazineInlineTitle text={step.title} />
              </h3>
              <p className='dark:text-dark-background/76 mt-3 text-base leading-[1.55] text-background/76'>
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}
