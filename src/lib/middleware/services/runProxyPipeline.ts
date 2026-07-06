import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { ProxyPipelineDependencies, MiddlewareContext } from '@types'

export async function runProxyPipeline(
  request: NextRequest,
  context: MiddlewareContext,
  deps: ProxyPipelineDependencies
): Promise<NextResponse> {

  const response = NextResponse.next()
  const interactions = deps.detectInteractions(context.url.searchParams)
  const plan = deps.planActions(interactions, context.isProduction)
  deps.applyCookies(response, plan.cookiesToSet)
  await deps.dispatchLogs(request, plan.logsToDispatch, {
    userAgent: context.userAgent,
    referer: context.referer
  })

  return deps.legacyHandler(request, response)
}
