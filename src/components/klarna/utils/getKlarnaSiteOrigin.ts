export function getKlarnaSiteOrigin(): string {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, '')
  }

  return 'https://utekos.no'
}
