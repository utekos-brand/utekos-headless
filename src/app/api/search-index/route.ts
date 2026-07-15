// Path: src/app/api/search-index/route.ts
import { buildSearchIndex } from '@/lib/helpers/search'
import { NextResponse, connection } from 'next/server'
import { cacheLife } from 'next/cache'
import { addCacheTag } from '@vercel/functions'

const SEARCH_INDEX_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  'Vercel-CDN-Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
}

async function getCachedSearchIndex() {
  'use cache'
  cacheLife('hours')
  const { groups } = buildSearchIndex()

  return groups
}

export async function GET() {
  await connection()

  try {
    const groups = await getCachedSearchIndex()
    await addCacheTag('search-index:v1')

    return NextResponse.json(
      { groups },
      {
        status: 200,
        headers: SEARCH_INDEX_CACHE_HEADERS
      }
    )
  } catch (error) {
    console.error('Failed to build search index:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
