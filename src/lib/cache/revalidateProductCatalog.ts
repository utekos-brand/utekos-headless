import 'server-only'

import { revalidateTag } from 'next/cache'
import { TAGS } from '@/api/constants'

export function revalidateProductCatalog(handles: readonly string[] = []): string[] {
  const tags = new Set<string>([TAGS.products])

  for (const handle of handles) {
    const normalizedHandle = handle.trim()

    if (normalizedHandle) {
      tags.add(`product-${normalizedHandle}`)
      tags.add(`related-products-${normalizedHandle}`)
    }
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }

  return Array.from(tags)
}
