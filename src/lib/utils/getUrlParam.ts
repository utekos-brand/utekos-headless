export function getUrlParam(
  urlString: string | undefined,
  key: string,
  validator?: RegExp
): string | undefined {
  if (typeof urlString !== 'string') return undefined

  try {
    const url = new URL(urlString)
    const value = url.searchParams.get(key)

    if (!value) return undefined

    if (validator && !validator.test(value)) {
      return undefined
    }

    return value
  } catch {
    return undefined
  }
}
