const IGNORED_ERROR_PATTERNS = [
  'window.webkit.messageHandlers',
  'sendDataToNative',
  'webkit.messageHandlers'
]

export const CHROME_EXTENSION_URL_PATTERN = /^chrome-extension:\/\//i

type ClientErrorDetails = {
  message: string
  source?: string | undefined
  stack?: string | undefined
}

export function isIgnorableClientError({ message, source, stack }: ClientErrorDetails): boolean {
  if (source && CHROME_EXTENSION_URL_PATTERN.test(source)) {
    return true
  }

  return IGNORED_ERROR_PATTERNS.some(pattern => message.includes(pattern) || stack?.includes(pattern))
}
