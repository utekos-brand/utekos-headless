import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import type { MagazineArticle } from '../types'
import { MagazineCategoryBadge } from './MagazineCategoryBadge'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineGridProps = { articles: MagazineArticle[] }

function FeaturedArticleCard({
  article
}: {
  article: MagazineArticle
}) {
  return (
    <article className='bg-overcast dark:text-dark-background py-14 text-background sm:py-20'>
      <div className='container mx-auto px-4'>
        <Link
          href={`/magasinet/${article.slug}` as Route}
          className='group dark:border-dark-background/10 grid overflow-hidden rounded-lg border border-background/10 bg-foreground shadow-[0_24px_70px_-54px_color-mix(in_oklch,var(--background)_68%,transparent)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:grid-cols-2'
          data-track='MagazineFeaturedClick'
        >
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            width={article.heroImage.width}
            height={article.heroImage.height}
            sizes='(max-width: 768px) calc(100vw - 32px), 50vw'
            className='aspect-16/11 h-auto w-full object-cover md:aspect-auto md:h-full'
            priority
          />
          <div className='flex flex-col justify-center p-6 sm:p-9 lg:p-12'>
            <div className='mb-5'>
              <MagazineCategoryBadge
                category={article.category}
              />
            </div>
            <h2 className='dark:text-dark-background font-sans text-4xl leading-[0.95] font-bold text-balance text-background sm:text-5xl'>
              <MagazineInlineTitle text={article.title} />
            </h2>
            <p className='leading-text-paragraph dark:text-dark-background/90 mt-5 text-lg text-background/90'>
              {article.excerpt}
            </p>
            <span className='text-havdyp mt-8 inline-flex items-center gap-2 text-base leading-4 font-semibold'>
              Les hele saken
              <ArrowRight
                className='size-4 transition-transform group-hover:translate-x-1'
                aria-hidden
              />
            </span>
          </div>
        </Link>
      </div>
    </article>
  )
}

function MagazineArticleCard({
  article
}: {
  article: MagazineArticle
}) {
  return (
    <li>
      <Link
        href={`/magasinet/${article.slug}` as Route}
        className='group dark:border-dark-background/10 block h-full overflow-hidden rounded-lg border border-background/10 bg-foreground transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
        data-track='MagazineGridClick'
      >
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          width={article.heroImage.width}
          height={article.heroImage.height}
          sizes='(max-width: 768px) calc(100vw - 32px), (max-width: 1200px) 45vw, 30vw'
          className='aspect-16/10 h-auto w-full object-cover'
        />
        <div className='p-5'>
          <div className='mb-4'>
            <MagazineCategoryBadge category={article.category} />
          </div>
          <h3 className='dark:text-dark-background group-hover:text-havdyp font-sans text-2xl leading-[0.98] font-bold text-background transition-colors'>
            <MagazineInlineTitle text={article.title} />
          </h3>
          <p className='dark:text-dark-background/72 mt-3 text-sm leading-normal text-background/72'>
            {article.excerpt}
          </p>
        </div>
      </Link>
    </li>
  )
}

export function MagazineGrid({ articles }: MagazineGridProps) {
  const [featuredArticle, ...otherArticles] = articles

  if (!featuredArticle) {
    return (
      <article className='bg-overcast dark:text-dark-background py-16 text-background'>
        <div className='container mx-auto px-4'>
          <p className='text-lg leading-[1.55]'>
            Ingen artikler er publisert ennå.
          </p>
        </div>
      </article>
    )
  }

  return (
    <>
      <FeaturedArticleCard article={featuredArticle} />
      <article
        className='bg-overcast dark:text-dark-background pb-16 text-background sm:pb-24'
        aria-labelledby='magazine-latest-heading'
      >
        <div className='container mx-auto px-4'>
          <header className='mb-8 max-w-2xl'>
            <p className='text-havdyp text-sm leading-4 font-semibold'>
              Siste fra magasinet
            </p>
            <h2
              id='magazine-latest-heading'
              className='mt-2 font-sans text-4xl leading-[0.95] font-bold sm:text-5xl'
            >
              Flere guider og historier
            </h2>
          </header>
          <ul className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {otherArticles.map(article => (
              <MagazineArticleCard
                key={article.slug}
                article={article}
              />
            ))}
          </ul>
        </div>
      </article>
    </>
  )
}
