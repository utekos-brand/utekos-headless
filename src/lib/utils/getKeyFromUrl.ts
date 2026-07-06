export function getKeyFromUrl(
  urlString: string | undefined
): string | undefined {
  if (typeof urlString !== 'string') return undefined

  try {
    const url = new URL(urlString)

    const key = url.searchParams.get('key')

    if (key && /^[a-f0-9]{32}$/i.test(key)) {
      return key
    }
  } catch (e) {}

  return undefined
}
