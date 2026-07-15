export type PageViewContext = Readonly<{
  pageUrl: string
  pageViewId: string
  referrerUrl?: string
}>

type EnsurePageViewInput = {
  pageUrl: string
  documentReferrer?: string
}

type PageViewListener = (context: PageViewContext) => void

type ActivePageView = PageViewContext & { emitted: boolean }

export function createPageViewSession(
  createId: () => string = () => globalThis.crypto.randomUUID()
) {
  let activePageView: ActivePageView | null = null
  const listeners = new Set<PageViewListener>()

  function ensure(input: EnsurePageViewInput): PageViewContext {
    const pageUrl = normalizeRequiredHttpUrl(input.pageUrl)

    if (activePageView?.pageUrl === pageUrl) {
      return toPublicContext(activePageView)
    }

    const referrerUrl =
      activePageView?.pageUrl ??
      normalizeOptionalHttpUrl(input.documentReferrer)

    activePageView = {
      pageUrl,
      pageViewId: createId(),
      ...(referrerUrl ? { referrerUrl } : {}),
      emitted: false
    }

    return toPublicContext(activePageView)
  }

  function hasEmitted(pageViewId: string): boolean {
    return (
      activePageView?.pageViewId === pageViewId &&
      activePageView.emitted
    )
  }

  function recordEmitted(context: PageViewContext): boolean {
    const pageUrl = normalizeRequiredHttpUrl(context.pageUrl)

    if (
      activePageView?.pageUrl === pageUrl &&
      activePageView.pageViewId === context.pageViewId &&
      activePageView.emitted
    ) {
      return false
    }

    const referrerUrl =
      normalizeOptionalHttpUrl(context.referrerUrl) ??
      (activePageView?.pageUrl === pageUrl ?
        activePageView.referrerUrl
      : undefined)

    activePageView = {
      pageUrl,
      pageViewId: context.pageViewId,
      ...(referrerUrl ? { referrerUrl } : {}),
      emitted: true
    }

    const emittedContext = toPublicContext(activePageView)

    for (const listener of listeners) {
      listener(emittedContext)
    }

    return true
  }

  function subscribe(listener: PageViewListener): () => void {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  }

  return { ensure, hasEmitted, recordEmitted, subscribe }
}

export const browserPageViewSession = createPageViewSession()

function toPublicContext(
  pageView: ActivePageView
): PageViewContext {
  return {
    pageUrl: pageView.pageUrl,
    pageViewId: pageView.pageViewId,
    ...(pageView.referrerUrl ?
      { referrerUrl: pageView.referrerUrl }
    : {})
  }
}

function normalizeRequiredHttpUrl(value: string): string {
  const normalized = normalizeOptionalHttpUrl(value)

  if (!normalized) {
    throw new Error('pageUrl must be an absolute HTTP(S) URL')
  }

  return normalized
}

function normalizeOptionalHttpUrl(
  value: string | undefined
): string | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined
    }

    return url.href
  } catch {
    return undefined
  }
}
