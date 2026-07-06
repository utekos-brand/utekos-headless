// Path: src/app/inspirasjon/terrassen/data/jsonLd.ts

import type { Article, WithContext } from 'schema-dts'

export const jsonLd: WithContext<Article> = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': 'Utekos på Terrassen: Slik skaper du et ekstra rom uten vegger',
  'description':
    'En komplett guide til hvordan du kan maksimere bruken av terrassen eller balkongen din med Utekos. Tips og inspirasjon for å forlenge utendørssesongen hjemme.',
  'url': 'https://utekos.no/inspirasjon/terrassen',
  'image': 'https://utekos.no/og-image-terrassen.webp',
  'inLanguage': 'nb-NO',
  'isAccessibleForFree': true,
  'keywords': [
    'terrasse',
    'terrasseliv',
    'balkong',
    'utestue',
    'hjemmekos',
    'forlenge kvelden ute',
    'terrassevarmer alternativ',
    'hageinspirasjon'
  ],
  'about': [
    {
      '@type': 'Thing',
      'name': 'Terrasse'
    },
    {
      '@type': 'Thing',
      'name': 'Balkong'
    },
    {
      '@type': 'Thing',
      'name': 'Utekos'
    }
  ],
  'author': {
    '@type': 'Organization',
    'name': 'Utekos',
    'url': 'https://utekos.no'
  },
  'publisher': {
    '@type': 'Organization',
    'name': 'Utekos',
    'url': 'https://utekos.no',
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://utekos.no/logo.png'
    }
  },
  'datePublished': '2026-04-17',
  'dateModified': '2026-05-23',
  'mainEntityOfPage': {
    '@type': 'WebPage',
    '@id': 'https://utekos.no/inspirasjon/terrassen'
  }
}
