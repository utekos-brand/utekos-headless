// Path: src/app/api/search-index/route.ts
import { buildSearchIndex } from '@/lib/helpers/search'
import { NextResponse } from 'next/server'
import { cacheLife } from 'next/cache'

async function getCachedSearchIndex() {
  'use cache'
  cacheLife('hours')
  const { groups } = buildSearchIndex()

  return groups
}

export async function GET() {
  try {
    const groups = await getCachedSearchIndex()

    return NextResponse.json(
      { groups },
      {
        status: 200
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
