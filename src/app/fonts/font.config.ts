import localFont from 'next/font/local'

export const utekosText = localFont({
  src: '../../app/fonts/UtekosTextRegular.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-utekos-text',
  preload: true,
  fallback: ['sans-serif', 'system-ui', 'Helvetica']
})

export const utekosTextMedium = localFont({
  src: '../../app/fonts/UtekosTextMedium.woff2',
  weight: '500',
  display: 'swap',
  style: 'normal',
  variable: '--font-utekos-text-medium',
  preload: false,
  fallback: ['sans-serif', 'system-ui', 'Helvetica']
})

export const googleSans = localFont({
  src: '../../../node_modules/@fontsource-variable/google-sans/files/google-sans-latin-wght-normal.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-google-sans',
  preload: false,
  fallback: ['system-ui', 'sans-serif']
})
