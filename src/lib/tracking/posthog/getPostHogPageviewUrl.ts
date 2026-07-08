type PostHogPageviewLocation = {
  origin: string
  pathname: string
  search?: string
  hash?: string
}

export function getPostHogPageviewUrl(location: PostHogPageviewLocation): string {
  return new URL(location.pathname, location.origin).toString()
}
