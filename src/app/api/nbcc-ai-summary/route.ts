import { NextResponse } from 'next/server'

import {
  generateNbccAiSummary,
  getNbccAiSummaryFallback,
  isNbccAiSummaryIntent
} from '@/app/nbcc/utils/nbccAiSummary'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const intent = searchParams.get('intent')

  if (!isNbccAiSummaryIntent(intent)) {
    return NextResponse.json(
      {
        error: 'Missing or invalid intent'
      },
      { status: 400 }
    )
  }

  try {
    const summary = await generateNbccAiSummary(intent)

    return NextResponse.json({
      ...summary,
      generated: true
    })
  } catch (error) {
    console.error(`[nbcc-ai-summary] failed for ${intent}:`, error)

    return NextResponse.json({
      ...getNbccAiSummaryFallback(intent),
      generated: false
    })
  }
}
