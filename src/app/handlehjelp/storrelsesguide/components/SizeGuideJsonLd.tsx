import { cacheLife, cacheTag } from 'next/cache'
import { SITE_URL } from '@/constants'
import type { BreadcrumbList, FAQPage, Graph, WebPage } from 'schema-dts'

const PAGE_URL = `${SITE_URL}/handlehjelp/storrelsesguide`
const WEBSITE_ID = `${SITE_URL}/#website`
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const WEBPAGE_ID = `${PAGE_URL}#webpage`
const BREADCRUMB_ID = `${PAGE_URL}#breadcrumb`
const FAQ_ID = `${PAGE_URL}#faq`

export async function SizeGuideJsonLd() {
  'use cache'
  cacheLife('max')
  cacheTag('jsonld-size-guide')

  const webPage: WebPage = {
    '@type': 'WebPage',
    '@id': WEBPAGE_ID,
    'url': PAGE_URL,
    'name': 'Størrelsesguide for Utekos',
    'description':
      'Størrelsesguide for Utekos Dun, Mikrofiber og Comfyrobe med praktiske mål og råd for riktig passform.',
    'inLanguage': 'nb-NO',
    'isPartOf': { '@id': WEBSITE_ID },
    'breadcrumb': { '@id': BREADCRUMB_ID },
    'mainEntity': { '@id': FAQ_ID },
    'publisher': { '@id': ORGANIZATION_ID }
  }

  const breadcrumb: BreadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': BREADCRUMB_ID,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Forsiden',
        'item': SITE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Størrelsesguide'
      }
    ]
  }

  const faq: FAQPage = {
    '@type': 'FAQPage',
    '@id': FAQ_ID,
    'mainEntityOfPage': { '@id': WEBPAGE_ID },
    'author': { '@id': ORGANIZATION_ID },
    'publisher': { '@id': ORGANIZATION_ID },
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Hvilken størrelse Utekos-plagg skal jeg velge?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text':
            'Våre plagg er designet for en romslig og komfortabel passform. Vi anbefaler å se på målene for hvert spesifikke produkt i vår størrelsesguide. Et godt tips er å sammenligne målene med et favorittplagg du har hjemme.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Hva er forskjellen i størrelse mellom Utekos Dun og Comfyrobe?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text':
            'Comfyrobe har en mer detaljert størrelsesinndeling (XS/S, M/L, L/XL), mens Utekos Dun og Mikrofiber kommer i to hovedstørrelser (Medium og Large) designet for å passe et bredt spekter av kroppsfasonger. Se de nøyaktige målene for hvert produkt på vår størrelsesguide-side.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Hvordan måler jeg for å finne riktig størrelse?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text':
            'Legg et lignende plagg du eier flatt på et gulv eller bord. Mål punkter som total lengde, brystbredde og ermelengde, og sammenlign disse med målene i våre tabeller for å finne den beste matchen.'
        }
      }
    ]
  }

  const jsonLd: Graph = {
    '@context': 'https://schema.org',
    '@graph': [webPage, breadcrumb, faq]
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')
      }}
    />
  )
}
