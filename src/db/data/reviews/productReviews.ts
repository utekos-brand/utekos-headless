export type ProductReviewItem = {
  author: string
  datePublished: string
  ratingValue: 1 | 2 | 3 | 4 | 5
  reviewBody: string
}

export type ProductReviewBundle = {
  aggregateRating: {
    ratingValue: number
    reviewCount: number
    ratingCount: number
    bestRating: 1 | 2 | 3 | 4 | 5
    worstRating: 1 | 2 | 3 | 4 | 5
  }
  reviews: ProductReviewItem[]
}

export const productReviewBundles: Record<string, ProductReviewBundle> = {
  'utekos-techdown': {
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 8,
      ratingCount: 8,
      bestRating: 5,
      worstRating: 4
    },
    reviews: [
      {
        author: 'Kjetil Hodne',
        datePublished: '2026-03-16',
        ratingValue: 5,
        reviewBody:
          'Veldig kjekk å ha på kalde kvelder, gjør at du ikke trenger å gå pga. at du fryser😊'
      },
      {
        author: 'Monika Hansen',
        datePublished: '2026-02-23',
        ratingValue: 5,
        reviewBody:
          'Den var utrolig deilig å ha på ute i sneborgen. Varm og god over hele kroppen.'
      },
      {
        author: 'A',
        datePublished: '2026-02-09',
        ratingValue: 5,
        reviewBody:
          'Jeg kjøpte den til sønnen min som sitter i rullestolen og nå holder han seg godt og varmt 👍'
      },
      {
        author: 'Raimond',
        datePublished: '2026-01-29',
        ratingValue: 5,
        reviewBody:
          'Enkelt å bestille, rask levering og flott produkt.'
      }
    ]
  },
  'utekos-mikrofiber': {
    aggregateRating: {
      ratingValue: 5,
      reviewCount: 4,
      ratingCount: 4,
      bestRating: 5,
      worstRating: 4
    },
    reviews: [
      {
        author: 'Gunnar Lie Eide',
        datePublished: '2026-04-05',
        ratingValue: 5,
        reviewBody:
          'Utekos er prøvd på altan i sur nordaustavind og 4 grader. Den svarte til forventningene. Lurt å lære seg rett bruk av snøring. Den holdt meg varm og god. 🤩'
      },
      {
        author: 'Ørjan',
        datePublished: '2026-02-28',
        ratingValue: 5,
        reviewBody:
          'Veldig behagelig på. Veldig hyggelig og hjelpsom betjening som stilte opp med varene under 24 timer etter bestilling.'
      },
      {
        author: 'Carina Johansen',
        datePublished: '2026-01-24',
        ratingValue: 5,
        reviewBody: 'Fantastisk 😊'
      },
      {
        author: 'Synnøve Knappen',
        datePublished: '2026-01-06',
        ratingValue: 5,
        reviewBody: 'Super utekosdress 🤩'
      }
    ]
  }
}