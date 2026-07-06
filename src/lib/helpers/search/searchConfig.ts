// Path: src/lib/helpers/search/searchConfig.ts

export type SearchConfigItem = {
  id: string
  title: string
  path: string
  keywords: string[]
  group: 'products' | 'magazine' | 'inspiration' | 'help' | 'pages'
}

/**
 * Statisk konfigurasjon av alt søkbart innhold
 * Oppdater denne når du legger til nye sider/produkter
 */
export const SEARCH_CONFIG: SearchConfigItem[] = [
  {
    id: 'page-home',
    title: 'Forsiden',
    path: '/',
    keywords: ['hjem', 'forside', 'start', 'utekos'],
    group: 'pages'
  },
  {
    id: 'page-produkter',
    title: 'Produkter',
    path: '/produkter',
    keywords: ['produktside', 'produkter', 'utekos', 'kolleksjoner', 'produkt', 'utekos'],
    group: 'pages'
  },
  {
    id: 'page-magasinet',
    title: 'Utekos magasinet',
    path: '/magasinet',
    keywords: ['magasinet', 'tips', 'artikler'],
    group: 'pages'
  },
  {
    id: 'page-gaveguide',
    title: 'Gaveguide',
    path: '/gaveguide',
    keywords: ['gave', 'gaver', 'presang', 'jul', 'bursdag', 'gaveguide', 'tips', 'ideer'],
    group: 'pages'
  },
  {
    id: 'page-personvern',
    title: 'Personvern',
    path: '/personvern',
    keywords: ['personvern', 'privacy', 'gdpr', 'cookies', 'data', 'policy', 'persondata'],
    group: 'pages'
  },
  {
    id: 'page-om-oss',
    title: 'Om oss',
    path: '/om-oss',
    keywords: ['om oss', 'om', 'about', 'historie', 'bedrift', 'selskap'],
    group: 'pages'
  },
  {
    id: 'page-kontakt',
    title: 'Kontaktskjema',
    path: '/kontaktskjema',
    keywords: ['kontakt', 'support', 'hjelp', 'kundeservice', 'spørsmål', 'melding', 'epost', 'mail'],
    group: 'pages'
  },
  {
    id: 'page-frakt',
    title: 'Frakt og retur',
    path: '/frakt-og-retur',
    keywords: ['frakt', 'retur', 'levering', 'sending', 'returnering', 'bytte', 'leveringstid', 'shipping'],
    group: 'pages'
  },
  // ========== PRODUKTER ==========
  {
    id: 'product-utekos-dun',
    title: 'Utekos Dun™',
    path: '/produkter/utekos-dun',
    keywords: [
      'dun',
      'dunjakke',
      'varmest',
      'ytterplagg',
      'jakke',
      'vinterjakke',
      'termojakke',
      'dunpose',
      'varm',
      'friluft'
    ],
    group: 'products'
  },
  {
    id: 'product-utekos-mikrofiber',
    title: 'Utekos Mikrofiber™',
    path: '/produkter/utekos-mikrofiber',
    keywords: ['mikrofiber', 'syntetisk', 'jakke', 'lett', 'pustende', 'isolasjon', 'tynn', 'kompakt'],
    group: 'products'
  },
  {
    id: 'product-utekos-techdown',
    title: 'Utekos TechDown™',
    path: '/produkter/utekos-techdown',
    keywords: ['techdown', 'hybrid', 'syntetisk dun', 'varm', 'jakke', 'isolert', 'mellomting'],
    group: 'products'
  },
  {
    id: 'product-utekos-stapper',
    title: 'Utekos Stapper™',
    path: '/produkter/utekos-stapper',
    keywords: ['stapper', 'bag', 'kompresjonsbag', 'pose', 'kompresjon'],
    group: 'products'
  },
  {
    id: 'product-comfyrobe',
    title: 'Comfyrobe™',
    path: '/produkter/comfyrobe',
    keywords: ['comfyrobe', 'morgenkåpe', 'kåpe', 'badekåpe', 'robe', 'innendørs', 'komfort', 'myk', 'varm'],
    group: 'products'
  },

  // ========== INSPIRASJON ==========
  {
    id: 'inspiration-bobil',
    title: 'Bobilliv',
    path: '/inspirasjon/bobil',
    keywords: [
      'bobil',
      'camping',
      'bobiltur',
      'bobilreise',
      'bobilliv',
      'autocamper',
      'campingvogn',
      'friluft'
    ],
    group: 'inspiration'
  },
  {
    id: 'inspiration-hytteliv',
    title: 'Hytteliv',
    path: '/inspirasjon/hytteliv',
    keywords: [
      'hytte',
      'hytteliv',
      'hyttekos',
      'fjell',
      'vinterferie',
      'hyttetur',
      'påskeferie',
      'fjellhytte'
    ],
    group: 'inspiration'
  },
  {
    id: 'inspiration-batliv',
    title: 'Båtliv',
    path: '/inspirasjon/batliv',
    keywords: ['båt', 'båtliv', 'seilbåt', 'motorbåt', 'sjø', 'båttur', 'marin', 'seiling'],
    group: 'inspiration'
  },
  {
    id: 'inspiration-terrassen',
    title: 'Terrasseliv',
    path: '/inspirasjon/terrassen',
    keywords: ['terrasse', 'uteplass', 'balkong', 'uterom', 'terrasseliv', 'hage', 'utendørs', 'altan'],
    group: 'inspiration'
  },
  {
    id: 'inspiration-grillkvelden',
    title: 'Grillkvelden',
    path: '/inspirasjon/grillkvelden',
    keywords: ['grill', 'grilling', 'barbeque', 'bbq', 'grillkveld', 'utegrill', 'sommer', 'mat'],
    group: 'inspiration'
  },

  // ========== HANDLEHJELP ==========
  {
    id: 'help-sammenlign',
    title: 'Sammenlign modeller',
    path: '/handlehjelp/sammenlign-modeller',
    keywords: [
      'sammenlign',
      'sammenligne',
      'forskjell',
      'versus',
      'vs',
      'modeller',
      'velge',
      'hvilket',
      'hjelp'
    ],
    group: 'help'
  },
  {
    id: 'help-storrelsesguide',
    title: 'Størrelsesguide',
    path: '/handlehjelp/storrelsesguide',
    keywords: [
      'størrelse',
      'størrelsesguide',
      'mål',
      'måltabell',
      'passform',
      'small',
      'medium',
      'large',
      'xl',
      'xxl'
    ],
    group: 'help'
  },
  {
    id: 'help-teknologi',
    title: 'Teknologi & materialer',
    path: '/handlehjelp/teknologi-materialer',
    keywords: [
      'teknologi',
      'materialer',
      'stoff',
      'isolasjon',
      'membrane',
      'vanntett',
      'pustende',
      'kvalitet'
    ],
    group: 'help'
  },
  {
    id: 'help-vask',
    title: 'Vask og vedlikehold',
    path: '/handlehjelp/vask-og-vedlikehold',
    keywords: [
      'vask',
      'vaske',
      'vedlikehold',
      'rengjøring',
      'pleie',
      'stelle',
      'hvordan vaske',
      'impregnering'
    ],
    group: 'help'
  }
]

/**
 * Grupper for visning i søkedialog
 */
export const GROUP_LABELS: Record<string, string> = {
  products: 'Produkter',
  magazine: 'Magasinet',
  inspiration: 'Inspirasjon',
  help: 'Handlehjelp',
  pages: 'Sider'
}
