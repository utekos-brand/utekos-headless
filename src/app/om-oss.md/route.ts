import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { frontmatter } from '../om-oss/page.mdx'
import { parseAboutPageFrontmatter, toAbsoluteUrl } from '../om-oss/seo/aboutPageSeo'

const sourceFile = join(process.cwd(), 'src/app/om-oss/page.mdx')
const page = parseAboutPageFrontmatter(frontmatter)

export async function GET() {
  const markdown = await readFile(sourceFile, 'utf8')

  return new Response(markdown, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Type': 'text/markdown; charset=utf-8',
      'Link': `<${toAbsoluteUrl(page.canonical)}>; rel="canonical"`,
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, follow'
    }
  })
}
