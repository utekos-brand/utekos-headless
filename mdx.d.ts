declare module '*.mdx' {
  import type { MDXContent } from 'mdx/types'

  export const frontmatter: unknown
  export const metadata: unknown

  const content: MDXContent
  export default content
}
