import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import type { MagazineArticle } from '../types'
import { MagazineInlineTitle } from './MagazineInlineTitle'

type MagazineRelatedArticlesProps = {
  articles: MagazineArticle[]
}

export function MagazineRelatedArticles({
  articles
}: MagazineRelatedArticlesProps) {
  if (articles.length === 0) {
    return null
  }

  return (
    <article className='border-background/10 text-background border-t border-background/10 bg-foreground py-16 text-background'>
      <div className='container mx-auto px-4'>
        <header className='mb-8 max-w-2xl'>
          <p className='text-card text-sm leading-4 font-semibold'>
            Les videre
          </p>
          <h2 className='mt-2 font-sans text-4xl leading-[0.95] font-bold'>
            Flere guider fra magasinet
          </h2>
        </header>
        <ul className='grid grid-cols-1 gap-5 md:grid-cols-3'>
          {articles.map(article => (
            <li key={article.slug}>
              <Link
                href={`/magasinet/${article.slug}` as Route}
                className='group bg-muted border-background/10 block h-full overflow-hidden rounded-lg border border-background/10 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
              >
                <Image
                  src={article.heroImage.src}
                  alt={article.heroImage.alt}
                  width={article.heroImage.width}
                  height={article.heroImage.height}
                  sizes='(max-width: 768px) calc(100vw - 32px), 30vw'
                  className='aspect-16/10 h-auto w-full object-cover'
                />
                <div className='p-5'>
                  <h3 className='text-background group-hover:text-card font-sans text-2xl leading-[0.98] font-bold text-background transition-colors'>
                    <MagazineInlineTitle text={article.title} />
                  </h3>
                  <p className='text-background/72 mt-3 text-sm leading-normal text-background/72'>
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
