import { CalendarDays, Clock, PencilLine } from 'lucide-react'
import type { MagazineArticle } from '../types'
import { formatMagazineArticleDate } from '../utils/formatMagazineArticleDate'
import { MagazineArticleHeroImage } from './MagazineArticleHeroImage'
import { MagazineCategoryBadge } from './MagazineCategoryBadge'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineArticleHeaderProps = { article: MagazineArticle }

export function MagazineArticleHeader({
  article
}: MagazineArticleHeaderProps) {
  const publishedDate = formatMagazineArticleDate(
    article.publishedAt
  )
  const updatedDate =
    article.updatedAt !== article.publishedAt ?
      formatMagazineArticleDate(article.updatedAt)
    : null

  return (
    <header className='bg-card relative overflow-hidden text-foreground'>
      <div
        className='absolute inset-0 bg-[linear-gradient(140deg,color-mix(in_oklch,var(--background)_72%,transparent),transparent_58%)]'
        aria-hidden
      />
      <div className='relative container mx-auto grid gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.78fr)] lg:items-end lg:py-24'>
        <div className='max-w-4xl'>
          <div className='mb-7'>
            <MagazineCategoryBadge category={article.category} />
          </div>
          <h1 className='font-sans text-5xl leading-[0.9] font-bold text-balance sm:text-6xl lg:text-7xl'>
            <MagazineInlineTitle text={article.title} />
          </h1>
          <p className='leading-text-paragraph text-foreground/86 mt-6 max-w-3xl text-xl text-foreground/86 sm:text-2xl'>
            {article.excerpt}
          </p>
          <div className='/72 mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm leading-4 text-foreground/72'>
            <span className='inline-flex items-center gap-2'>
              <CalendarDays className='size-4' aria-hidden />
              <time dateTime={article.publishedAt}>
                {publishedDate}
              </time>
            </span>
            {updatedDate && (
              <span className='inline-flex items-center gap-2'>
                <PencilLine className='size-4' aria-hidden />
                <span>
                  Oppdatert{' '}
                  <time dateTime={article.updatedAt}>
                    {updatedDate}
                  </time>
                </span>
              </span>
            )}
            {article.readingTimeMinutes && (
              <span className='inline-flex items-center gap-2'>
                <Clock className='size-4' aria-hidden />
                <span>
                  {article.readingTimeMinutes} min lesing
                </span>
              </span>
            )}
            {article.author && (
              <span>Av {article.author.name}</span>
            )}
          </div>
        </div>
        <MagazineArticleHeroImage article={article} />
      </div>
    </header>
  )
}
