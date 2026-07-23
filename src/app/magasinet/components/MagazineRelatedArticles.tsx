import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import type { MagazineArticle } from '../types'

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
    <article className='dark:border-dark-background/10 dark:text-dark-background border-t border-background/10 bg-foreground py-16 text-background'>
      <div className='container mx-auto px-4'>
        <header className='mb-8 max-w-2xl'>
          <p className='text-havdyp text-sm leading-4 font-semibold'>
            Les videre
          </p>
          <h2 className='mt-2 font-sans text-4xl leading-[0.95] font-bold'>
            Flere guider fra magasinet
          </h2>
        </header>
        <ul className='grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-3'>
          {articles.map(article => (
            <li key={article.slug} className='h-full'>
              <Link
                href={`/magasinet/${article.slug}` as Route}
                className='group bg-overcast flex h-full flex-col overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
              >
                <Image
                  src={article.heroImage.src}
                  alt={article.heroImage.alt}
                  width={article.heroImage.width}
                  height={article.heroImage.height}
                  sizes='(max-width: 768px) calc(100vw - 32px), 30vw'
                  className='aspect-16/10 h-auto w-full shrink-0 object-cover'
                />
                <div className='flex flex-1 flex-col p-5'>
                  <h3 className='dark:text-dark-background group-hover:text-havdyp font-sans text-2xl leading-[0.98] font-bold text-background transition-colors'>
                    {article.title}
                  </h3>
                  <p className='font-utekos-text dark:text-dark-background/72 mt-3 flex-1 text-sm leading-[1.3] tracking-normal text-background/72'>
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
