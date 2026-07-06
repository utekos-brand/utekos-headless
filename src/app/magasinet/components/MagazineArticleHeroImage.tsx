import Image from 'next/image'
import type { MagazineArticle } from '../types'

type MagazineArticleHeroImageProps = { article: MagazineArticle }

export function MagazineArticleHeroImage({
  article
}: MagazineArticleHeroImageProps) {
  return (
    <figure className='dark:bg-dark-background overflow-hidden rounded-lg border border-foreground/12 bg-background shadow-[0_28px_90px_-58px_color-mix(in_oklch,var(--background)_92%,transparent)]'>
      <Image
        src={article.heroImage.src}
        alt={article.heroImage.alt}
        width={article.heroImage.width}
        height={article.heroImage.height}
        sizes='(max-width: 1024px) calc(100vw - 32px), 44vw'
        className='aspect-4/3h-auto w-full object-cover'
        priority
      />
      {article.heroImage.caption && (
        <figcaption className='dark:bg-dark-background leading-text-paragraph /72 bg-background px-5 py-4 text-sm text-foreground/72'>
          {article.heroImage.caption}
        </figcaption>
      )}
    </figure>
  )
}
