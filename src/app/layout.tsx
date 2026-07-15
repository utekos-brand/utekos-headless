// Path: src/app/layout.tsx

import '../globals.css'
import {
  googleSans,
  utekosText,
  utekosTextMedium
} from '@/app/fonts/font.config'
import { Suspense } from 'react'
import { mainMenu } from '@/db/config/menu.config'
import Footer from '@/components/footer/components/Footer'
import Header from '@/components/header/Header'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { OnlineStoreJsonLd } from './OnlineStoreJsonLd'
import { CartProviderLoader } from '@/components/providers/CartProviderLoader'
import { CONSENT_MODE_DEFAULTS } from '@/components/layout/CookieScript'
import {
  COOKIEBOT_DOMAIN_GROUP_ID,
  COOKIEBOT_SCRIPT_URL
} from '@/components/cookie-consent/cookiebotConfig'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { GoogleTagManager } from '@next/third-parties/google'
import { SITE_URL } from '@/constants'
import Script from 'next/script'
import type { Metadata } from 'next'

const googleTagGatewayOrigin =
  process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL ?
    `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === 'development' ?
    'http://localhost:3000'
  : SITE_URL

const googleTagGatewayUrl = new URL(
  '/__gtg/gtm.js',
  googleTagGatewayOrigin
).toString()

export const metadata: Metadata = {
  icons: { icon: '/icon.png', apple: '/apple-icon.png' },
  metadataBase: new URL('https://utekos.no'),
  title: {
    default: 'Utekos - Skreddersy varmen',
    template: '%s | Utekos'
  },
  description:
    'Utekos er en merkevare som designer funksjonelt yttertøy for kompromissløs komfort og overlegen allsidighet. Perfekt for hytteliv, bobilferie, telttur, i båt og terrasseliv.',
  alternates: { canonical: '/' },
  applicationName: 'Utekos',
  category: 'Yttertøy',
  manifest: '/manifest.webmanifest',
  authors: [{ name: 'Utekos', url: 'https://utekos.no' }],
  creator: 'Utekos',
  publisher: 'Utekos',
  formatDetection: {
    email: true,
    address: true,
    telephone: true
  },
  facebook: { appId: '1154247890253046' },
  pinterest: { richPin: true },
  appleWebApp: {
    capable: true,
    title: 'Utekos',
    statusBarStyle: 'default'
  },
  openGraph: {
    type: 'website',
    locale: 'no_NO',
    url: 'https://utekos.no',
    siteName: 'Utekos',
    title: 'Utekos - Skreddersy varmen',
    description:
      'Utekos er en merkevare som designer funksjonelt yttertøy for kompromissløs komfort og overlegen allsidighet. Perfekt for hytteliv, bobilferie, telttur, i båt og terrasseliv.',
    images: {
      url: 'https://utekos.no/og-kate-linn-kikkert-master.png',
      width: 1200,
      height: 630,
      alt: 'To kvinner som koser seg utendørs på terrassen med varme komfortplagg fra Utekos.'
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'index': true,
      'follow': true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    other: {
      'facebook-domain-verification':
        'e3q80hk1igl2celczeysvf7y1mltrs'
    }
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang='no'
      translate='no'
      suppressHydrationWarning
      className={`${utekosText.variable} ${utekosTextMedium.variable} ${googleSans.variable}`}
    >
      <head>
        <Script
          id='consent-mode-defaults'
          strategy='beforeInteractive'
          data-cookieconsent='ignore'
        >
          {CONSENT_MODE_DEFAULTS}
        </Script>
        <Script
          id='Cookiebot'
          src={COOKIEBOT_SCRIPT_URL}
          data-cbid={COOKIEBOT_DOMAIN_GROUP_ID}
          strategy='beforeInteractive'
        />
      </head>
      <body className='scroll-smooth bg-background text-foreground antialiased dark:bg-background dark:text-foreground'>
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          forcedTheme='dark'
          enableColorScheme
          disableTransitionOnChange
        >
          <OnlineStoreJsonLd />

          <Suspense fallback={null}>
            <CartProviderLoader>
              <SiteChrome
                header={<Header menu={mainMenu} />}
                footer={<Footer />}
              >
                {children}
              </SiteChrome>
            </CartProviderLoader>
          </Suspense>
        </ThemeProvider>

        <GoogleTagManager
          gtmId='GTM-5TWMJQFP'
          gtmScriptUrl={googleTagGatewayUrl}
        />
      </body>
    </html>
  )
}
